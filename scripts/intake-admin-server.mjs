// Product Intake dashboard — dev-only local control panel (Task A7).
//
//   npm run intake:admin      then open http://127.0.0.1:4317
//
// A standalone Node HTTP server (no deps) that reads/writes data/product-intake.json via the
// FileIntakeSource port. It is NOT part of the site's Cloudflare Worker build — the deployed
// site never exposes it — and it binds to 127.0.0.1 only. This is the write path the Worker
// runtime cannot provide (no filesystem). Use it to add, dispatch, and remove products.

import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { AffiliateLinkStore } from './affiliate-link-store.mjs';
import { FileIntakeSource } from './intake-source.mjs';
import { PRIORITY, IMAGE_RIGHTS, DELEGATION_KEYS } from './intake-constants.mjs';

const HOST = '127.0.0.1';
const PORT = Number(process.env.INTAKE_ADMIN_PORT) || 4317;
const ROOT = fileURLToPath(new URL('../', import.meta.url));

const readBody = (req, limit = 64 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) {
        const error = new Error('request body exceeds 64 KB');
        error.statusCode = 413;
        return reject(error);
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        resolve(null);
      }
    });
  });

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

function nextIntakeId(items) {
  const year = new Date().getFullYear();
  const max = items
    .map((i) => /^IN-\d{4}-(\d{4})$/.exec(i.intakeId || ''))
    .filter(Boolean)
    .reduce((m, x) => Math.max(m, Number(x[1])), 0);
  return `IN-${year}-${String(max + 1).padStart(4, '0')}`;
}

export function createAdminServer({ source = new FileIntakeSource(), links = new AffiliateLinkStore(), root = ROOT } = {}) {
  return http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(PAGE);
    }

    if (req.method === 'GET' && url.pathname === '/api/intake') {
      return json(res, 200, await source.list());
    }

    if (req.method === 'GET' && url.pathname === '/api/catalog') {
      const products = JSON.parse(readFileSync(path.join(root, 'data/products.json'), 'utf8'));
      const privateLinks = links.list();
      const published = products.map((product) => ({
        key: product.candidateId,
        source: 'published',
        status: 'published',
        name: product.name,
        category: product.category,
        route: product.route,
        providers: product.providers,
        affiliateLinks: privateLinks[product.candidateId] || {},
      }));
      const pipeline = (await source.list()).map((item) => ({
        ...item,
        key: item.intakeId,
        source: 'pipeline',
        affiliateLinks: privateLinks[item.intakeId] || {},
      }));
      return json(res, 200, {
        summary: { published: published.length, pipeline: pipeline.length },
        items: [...published, ...pipeline],
      });
    }

    if (req.method === 'PUT' && url.pathname === '/api/affiliate-link') {
      const body = await readBody(req);
      if (!body) return json(res, 400, { error: 'invalid JSON body' });
      const products = JSON.parse(readFileSync(path.join(root, 'data/products.json'), 'utf8'));
      const knownPublished = products.some((product) => product.candidateId === body.productKey);
      const knownPipeline = !knownPublished && Boolean(await source.get(body.productKey));
      if (!knownPublished && !knownPipeline) return json(res, 404, { error: 'unknown product key' });
      try {
        const link = links.set(body);
        return json(res, 200, { ok: true, link });
      } catch (e) {
        return json(res, 400, { error: e.message });
      }
    }

    if (req.method === 'DELETE' && url.pathname === '/api/affiliate-link') {
      const productKey = url.searchParams.get('productKey');
      const retailer = url.searchParams.get('retailer');
      if (!productKey || !retailer) return json(res, 400, { error: 'productKey and retailer are required' });
      return json(res, 200, { ok: true, removed: links.remove(productKey, retailer) });
    }

    if (req.method === 'POST' && url.pathname === '/api/intake') {
      const b = await readBody(req);
      if (!b) return json(res, 400, { error: 'invalid JSON body' });
      const items = await source.list();
      const providers = Array.isArray(b.providers) && b.providers.length
        ? b.providers.map((provider) => ({
            retailer: String(provider.retailer || '').trim(),
            productUrl: String(provider.productUrl || '').trim(),
            affiliateKeyRef: String(provider.affiliateKeyRef || '').trim(),
          }))
        : [{
            retailer: String(b.retailer || '').trim(),
            productUrl: String(b.productUrl || '').trim(),
            affiliateKeyRef: String(b.affiliateKeyRef || '').trim(),
          }];
      const images = Array.isArray(b.images)
        ? b.images.map((image) => ({
            kind: String(image.kind || 'reference').trim(),
            sourceUrl: String(image.sourceUrl || '').trim(),
            imageRights: String(image.imageRights || 'SOURCE_LINK_ONLY').trim(),
          }))
        : b.imageSourceUrl
          ? [{ kind: 'reference', sourceUrl: b.imageSourceUrl.trim(), imageRights: b.imageRights || 'SOURCE_LINK_ONLY' }]
          : [];
      const item = {
        intakeId: nextIntakeId(items),
        name: (b.name || '').trim(),
        category: (b.category || '').trim(),
        problemHypothesis: (b.problemHypothesis || '').trim(),
        providers,
        images,
        ownerNotes: (b.ownerNotes || '').trim(),
        priority: b.priority || 'medium',
        status: 'new',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      try {
        await source.add(item);
        return json(res, 201, { ok: true, item });
      } catch (e) {
        return json(res, 400, { error: e.message });
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/intake/dispatch') {
      const pending = await source.listPending();
      for (const it of pending) await source.dispatch(it.intakeId);
      return json(res, 200, { ok: true, dispatched: pending.map((i) => i.intakeId) });
    }

    const statusMatch = /^\/api\/intake\/([^/]+)\/status$/.exec(url.pathname);
    if (req.method === 'PATCH' && statusMatch) {
      const body = await readBody(req);
      if (!body) return json(res, 400, { error: 'invalid JSON body' });
      if (!['new', 'on-hold', 'rejected'].includes(body.status)) {
        return json(res, 400, { error: 'owner status must be new, on-hold, or rejected' });
      }
      try {
        const item = await source.setStatus(decodeURIComponent(statusMatch[1]), body.status);
        return json(res, 200, { ok: true, item });
      } catch (e) {
        return json(res, /no item/.test(e.message) ? 404 : 400, { error: e.message });
      }
    }

    if (req.method === 'PUT' && url.pathname.startsWith('/api/intake/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/intake/'.length));
      const body = await readBody(req);
      if (!body) return json(res, 400, { error: 'invalid JSON body' });
      try {
        const item = await source.update(id, body);
        return json(res, 200, { ok: true, item });
      } catch (e) {
        return json(res, /no item/.test(e.message) ? 404 : 400, { error: e.message });
      }
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/intake/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/intake/'.length));
      try {
        await source.remove(id);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 404, { error: e.message });
      }
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, e.statusCode || 500, { error: e.message });
  }
  });
}

// Export the wiring for tests; only listen when run directly.
const server = createAdminServer();
export { server, nextIntakeId };
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  server.listen(PORT, HOST, () => {
    console.log(`intake-admin: http://${HOST}:${PORT}  (dev-only; Ctrl-C to stop)`);
  });
}

// ---- the page (self-contained; brand tokens inline) -------------------------
const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Setup Sahla — Product Control</title>
<style>
  :root{--ink:#101411;--paper:#e9dfca;--lime:#c9ff4a;--cyan:#66d9e8;--cream:#fffdf7;--muted:#5b625b;--line:#c8c0ae;--danger:#9f2d2d;--ok:#27663a}
  *{box-sizing:border-box} body{margin:0;background:#f6f1e6;color:var(--ink);font:15px/1.5 "Segoe UI Variable","Segoe UI",Tahoma,sans-serif}
  button,input,select,textarea{font:inherit} button{cursor:pointer} button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}
  .topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:18px;padding:16px max(20px,calc((100% - 1320px)/2));background:var(--ink);color:var(--cream);border-bottom:5px solid var(--lime)}
  .brand{font-size:20px;font-weight:900;letter-spacing:-.02em}.brand span{color:var(--lime)}.local{margin-left:auto;color:#bfc8c0;font-size:12px}.local b{color:var(--cyan)}
  main{width:min(calc(100% - 32px),1320px);margin:0 auto;padding:28px 0 64px}
  .intro{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}.intro h1{margin:0 0 6px;font-size:clamp(28px,4vw,48px);line-height:1}.intro p{max-width:68ch;margin:0;color:var(--muted)}
  .btn{min-height:42px;border:1px solid var(--ink);border-radius:9px;padding:9px 14px;background:white;color:var(--ink);font-weight:750}.btn:hover{box-shadow:3px 3px 0 var(--ink);transform:translate(-1px,-1px)}.btn--primary{background:var(--lime)}.btn--ink{background:var(--ink);color:var(--cream)}.btn--danger{border-color:#d7aaaa;color:var(--danger);background:#fff7f7}.btn--small{min-height:34px;padding:6px 9px;font-size:12px}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.metric{padding:16px 18px;border:1px solid var(--ink);background:var(--cream);box-shadow:4px 4px 0 var(--paper)}.metric strong{display:block;font-size:28px;line-height:1}.metric span{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  .panel{border:1px solid var(--ink);border-radius:12px;background:var(--cream);overflow:hidden;box-shadow:7px 7px 0 var(--paper)}
  .toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 190px auto auto;gap:10px;padding:14px;border-bottom:1px solid var(--line);background:#fbf7ee}.toolbar input,.toolbar select{min-height:42px}
  input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:white;color:var(--ink);padding:9px 11px}textarea{min-height:82px;resize:vertical}label{display:block;margin:0 0 5px;font-size:12px;font-weight:800;color:var(--muted)}
  .table-wrap{overflow-x:auto}table{width:100%;min-width:940px;border-collapse:collapse}th,td{padding:13px 12px;border-bottom:1px solid var(--paper);text-align:left;vertical-align:top}th{background:var(--ink);color:var(--cream);font-size:11px;letter-spacing:.08em;text-transform:uppercase}tbody tr:hover{background:#fbf7ee}.product-name{font-weight:850}.product-key,.subtle{font-size:12px;color:var(--muted)}.provider-list{display:grid;gap:4px}.provider-list span{display:block}
  .pill{display:inline-flex;align-items:center;min-height:26px;border-radius:999px;padding:3px 9px;background:var(--paper);font-size:11px;font-weight:850;text-transform:uppercase;white-space:nowrap}.pill--published,.pill--verified{background:#dff5df;color:var(--ok)}.pill--new{background:#efe9d7}.pill--dispatched{background:var(--cyan)}.pill--ready{background:var(--lime)}.pill--on-hold{background:#ffe3a8;color:#704d00}.pill--rejected{background:#f5d3d3;color:var(--danger)}.pill--pending{background:#fff0be;color:#6d5000}
  .actions{display:flex;flex-wrap:wrap;gap:6px}.empty{padding:56px 20px;text-align:center;color:var(--muted)}.notice{position:fixed;right:18px;bottom:18px;z-index:30;max-width:420px;padding:12px 15px;border:1px solid var(--ink);border-left:8px solid var(--lime);border-radius:8px;background:var(--cream);box-shadow:5px 5px 0 var(--ink);display:none}.notice--error{border-left-color:#e26868}
  dialog{width:min(calc(100% - 28px),760px);max-height:90vh;border:1px solid var(--ink);border-radius:14px;padding:0;background:var(--cream);box-shadow:12px 12px 0 var(--ink)}dialog::backdrop{background:rgba(16,20,17,.68)}.dialog-head{display:flex;align-items:center;gap:16px;padding:18px 20px;background:var(--ink);color:var(--cream)}.dialog-head h2{margin:0;font-size:20px}.dialog-head button{margin-left:auto;color:var(--cream);border-color:#657066;background:transparent}.dialog-body{padding:20px;overflow:auto}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field--wide{grid-column:1/-1}.dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px;padding-top:16px;border-top:1px solid var(--paper)}
  .provider-rows{display:grid;gap:10px}.provider-row{display:grid;grid-template-columns:1fr 1.4fr 1.2fr auto;gap:8px;align-items:end;padding:10px;border:1px solid var(--paper);border-radius:9px;background:#fbf8f0}.provider-row button{margin-bottom:1px}.help{margin:5px 0 0;font-size:12px;color:var(--muted)}.warning{padding:10px 12px;border-left:6px solid var(--cyan);background:#edfafd;font-size:13px}
  @media(max-width:820px){.summary{grid-template-columns:1fr 1fr}.toolbar{grid-template-columns:1fr 1fr}.intro{align-items:flex-start;flex-direction:column}.provider-row{grid-template-columns:1fr}.provider-row button{justify-self:start}.form-grid{grid-template-columns:1fr}.field--wide{grid-column:auto}}
  @media(max-width:520px){main{width:min(calc(100% - 20px),1320px)}.topbar{padding:12px}.local{display:none}.summary{grid-template-columns:1fr 1fr}.toolbar{grid-template-columns:1fr}.toolbar .btn{width:100%}.dialog-body{padding:15px}.actions{min-width:220px}}
</style></head><body>
<header class="topbar"><div class="brand">Setup Sahla <span>Control</span></div><div class="local"><b>LOCAL ONLY</b> · private product and affiliate workspace</div></header>
<main>
  <section class="intro"><div><h1>Product control</h1><p>Keep every idea in one dashboard. Only researched and gate-approved products appear on the public website.</p></div><button class="btn btn--primary" id="addProductBtn" type="button">+ Add product</button></section>
  <section class="summary" aria-label="Catalog summary">
    <div class="metric"><strong id="publishedCount">0</strong><span>Published</span></div>
    <div class="metric"><strong id="pipelineCount">0</strong><span>In pipeline</span></div>
    <div class="metric"><strong id="holdCount">0</strong><span>On hold</span></div>
    <div class="metric"><strong id="linkCount">0</strong><span>Verified affiliate links</span></div>
  </section>
  <section class="panel" aria-labelledby="catalogHeading">
    <div class="toolbar"><input id="search" type="search" placeholder="Search products, IDs or categories" aria-label="Search products"><select id="statusFilter" aria-label="Filter status"><option value="all">All statuses</option></select><button class="btn" id="dispatchBtn" type="button">Dispatch new</button><button class="btn" id="refreshBtn" type="button">Refresh</button></div>
    <div class="table-wrap"><table><thead><tr><th id="catalogHeading">All products</th><th>Source / status</th><th>Retailers</th><th>Affiliate link</th><th>Actions</th></tr></thead><tbody id="catalogRows"></tbody></table></div>
    <div class="empty" id="emptyState" hidden>No products match this filter.</div>
  </section>
</main>
<div class="notice" id="notice" role="status" aria-live="polite"></div>

<dialog id="productDialog">
  <form id="productForm" method="dialog">
    <div class="dialog-head"><h2 id="productDialogTitle">Add product</h2><button class="btn btn--small" id="closeProductBtn" type="button">Close</button></div>
    <div class="dialog-body"><p class="warning">New products stay private until research, evidence, images and the publication gate are complete.</p>
      <div class="form-grid">
        <div><label for="productName">Product name</label><input id="productName" required></div>
        <div><label for="productCategory">Category</label><input id="productCategory" required></div>
        <div class="field--wide"><label for="productProblem">Problem hypothesis</label><textarea id="productProblem" required></textarea></div>
        <div><label for="productPriority">Priority</label><select id="productPriority"></select></div>
        <div id="statusField" hidden><label for="productStatus">Owner status</label><select id="productStatus"><option value="new">New</option><option value="on-hold">On hold</option><option value="rejected">Rejected</option></select></div>
        <div class="field--wide"><label>Retailer references</label><div class="provider-rows" id="providerRows"></div><button class="btn btn--small" id="addProviderBtn" type="button">+ Add retailer</button><p class="help">These are normal retailer/reference URLs. Add your affiliate URL separately.</p></div>
        <div><label for="imageSourceUrl">Image reference URL</label><input id="imageSourceUrl" type="url" placeholder="https://..."></div>
        <div><label for="imageRights">Image rights</label><select id="imageRights"></select></div>
        <div class="field--wide"><label for="ownerNotes">Owner notes</label><textarea id="ownerNotes"></textarea></div>
      </div>
      <div class="dialog-actions"><button class="btn" id="cancelProductBtn" type="button">Cancel</button><button class="btn btn--primary" type="submit">Save product</button></div>
    </div>
  </form>
</dialog>

<dialog id="affiliateDialog">
  <form id="affiliateForm" method="dialog">
    <div class="dialog-head"><h2>Affiliate link</h2><button class="btn btn--small" id="closeAffiliateBtn" type="button">Close</button></div>
    <div class="dialog-body"><p class="warning">Paste the complete link from your affiliate dashboard. Pending links stay private; verified links are inserted on the next site build.</p>
      <div class="form-grid">
        <div><label for="affiliateProduct">Product</label><input id="affiliateProduct" disabled></div>
        <div><label for="affiliateRetailer">Retailer</label><select id="affiliateRetailer"></select></div>
        <div class="field--wide"><label for="affiliateUrl">Your complete affiliate URL</label><input id="affiliateUrl" type="url" placeholder="https://..." required></div>
        <div><label for="affiliateStatus">Link status</label><select id="affiliateStatus"><option value="pending">Pending verification</option><option value="verified">Verified — use on public site</option></select></div>
      </div>
      <div class="dialog-actions"><button class="btn btn--danger" id="removeAffiliateBtn" type="button">Remove saved link</button><button class="btn" id="cancelAffiliateBtn" type="button">Cancel</button><button class="btn btn--primary" type="submit">Save affiliate link</button></div>
    </div>
  </form>
</dialog>

<script>
  const PRIORITIES=${JSON.stringify(PRIORITY)};
  const RIGHTS=${JSON.stringify(IMAGE_RIGHTS)};
  const STATUSES=['published','new','dispatched','ready','on-hold','rejected','promoted'];
  const state={items:[],editingKey:null,affiliateKey:null};
  const byId=(id)=>document.getElementById(id);
  function element(tag,className,text){const value=document.createElement(tag);if(className)value.className=className;if(text!==undefined)value.textContent=text;return value}
  function button(label,className,handler){const value=element('button',className,label);value.type='button';value.addEventListener('click',handler);return value}
  function fillSelect(select,values,selected){select.replaceChildren();for(const value of values){const option=document.createElement('option');option.value=value;option.textContent=value;option.selected=value===selected;select.append(option)}}
  function notify(message,error){const notice=byId('notice');notice.textContent=message;notice.classList.toggle('notice--error',Boolean(error));notice.style.display='block';clearTimeout(notify.timer);notify.timer=setTimeout(()=>{notice.style.display='none'},4200)}
  async function api(url,options){const response=await fetch(url,options);let body={};try{body=await response.json()}catch{}if(!response.ok)throw new Error(body.error||('Request failed: '+response.status));return body}
  function affiliateStats(item){const links=Object.values(item.affiliateLinks||{});return{verified:links.filter((link)=>link.status==='verified').length,pending:links.filter((link)=>link.status==='pending').length}}
  async function load(){try{const data=await api('/api/catalog');state.items=data.items;byId('publishedCount').textContent=String(data.summary.published);byId('pipelineCount').textContent=String(data.summary.pipeline);byId('holdCount').textContent=String(state.items.filter((item)=>item.status==='on-hold').length);byId('linkCount').textContent=String(state.items.reduce((total,item)=>total+affiliateStats(item).verified,0));render()}catch(error){notify(error.message,true)}}
  function render(){const query=byId('search').value.trim().toLowerCase();const status=byId('statusFilter').value;const items=state.items.filter((item)=>(status==='all'||item.status===status)&&(!query||[item.key,item.name,item.category].join(' ').toLowerCase().includes(query)));const rows=byId('catalogRows');rows.replaceChildren();byId('emptyState').hidden=items.length>0;for(const item of items)rows.append(catalogRow(item))}
  function catalogRow(item){const tr=document.createElement('tr');const identity=document.createElement('td');identity.append(element('div','product-name',item.name),element('div','product-key',item.key+' · '+(item.category||'Uncategorised')));tr.append(identity);
    const statusCell=document.createElement('td');statusCell.append(element('span','pill pill--'+item.status,item.status),element('div','subtle',item.source==='published'?'Public website':'Private pipeline'));tr.append(statusCell);
    const providers=document.createElement('td');const providerList=element('div','provider-list');for(const provider of item.providers||[]){const line=element('span','',provider.retailer);providerList.append(line)}providers.append(providerList);tr.append(providers);
    const linkCell=document.createElement('td');const stats=affiliateStats(item);if(stats.verified)linkCell.append(element('span','pill pill--verified',stats.verified+' verified'));if(stats.pending)linkCell.append(element('span','pill pill--pending',stats.pending+' pending'));if(!stats.verified&&!stats.pending)linkCell.append(element('span','subtle','Not added yet'));tr.append(linkCell);
    const actionCell=document.createElement('td');const actions=element('div','actions');actions.append(button('Affiliate link','btn btn--small',()=>openAffiliate(item)));if(item.source==='pipeline'){actions.append(button('Edit product','btn btn--small',()=>openProduct(item)));const holdLabel=item.status==='on-hold'?'Resume':'Put on hold';actions.append(button(holdLabel,'btn btn--small',()=>setOwnerStatus(item,item.status==='on-hold'?'new':'on-hold')));actions.append(button('Remove','btn btn--small btn--danger',()=>removeProduct(item)))}else if(item.route){const view=element('a','btn btn--small','View page');view.href=item.route;view.target='_blank';view.rel='noopener';actions.append(view)}actionCell.append(actions);tr.append(actionCell);return tr}
  function addProviderRow(provider){const row=element('div','provider-row');const retailerWrap=document.createElement('div');const retailerLabel=element('label','', 'Retailer');const retailer=document.createElement('input');retailer.className='provider-retailer';retailer.value=provider?.retailer||'';retailer.required=true;retailerWrap.append(retailerLabel,retailer);
    const urlWrap=document.createElement('div');urlWrap.append(element('label','','Public product URL'));const url=document.createElement('input');url.className='provider-url';url.type='url';url.value=provider?.productUrl||'';url.required=true;urlWrap.append(url);
    const keyWrap=document.createElement('div');keyWrap.append(element('label','','Affiliate key reference'));const key=document.createElement('input');key.className='provider-key';key.value=provider?.affiliateKeyRef||'';key.required=true;keyWrap.append(key);
    row.append(retailerWrap,urlWrap,keyWrap,button('Remove','btn btn--small btn--danger',()=>{if(byId('providerRows').children.length>1)row.remove()}));byId('providerRows').append(row)}
  function openProduct(item){state.editingKey=item?.key||null;byId('productDialogTitle').textContent=item?'Edit product':'Add product';byId('productName').value=item?.name||'';byId('productCategory').value=item?.category||'';byId('productProblem').value=item?.problemHypothesis||'';fillSelect(byId('productPriority'),PRIORITIES,item?.priority||'medium');byId('statusField').hidden=!item;if(item)byId('productStatus').value=['new','on-hold','rejected'].includes(item.status)?item.status:'new';byId('ownerNotes').value=item?.ownerNotes||'';const image=item?.images?.[0];byId('imageSourceUrl').value=image?.sourceUrl||'';fillSelect(byId('imageRights'),RIGHTS,image?.imageRights||'SOURCE_LINK_ONLY');byId('providerRows').replaceChildren();for(const provider of item?.providers?.length?item.providers:[{}])addProviderRow(provider);byId('productDialog').showModal()}
  function collectProviders(){return Array.from(document.querySelectorAll('.provider-row')).map((row)=>({retailer:row.querySelector('.provider-retailer').value.trim(),productUrl:row.querySelector('.provider-url').value.trim(),affiliateKeyRef:row.querySelector('.provider-key').value.trim()}))}
  async function saveProduct(event){event.preventDefault();const imageUrl=byId('imageSourceUrl').value.trim();const payload={name:byId('productName').value.trim(),category:byId('productCategory').value.trim(),problemHypothesis:byId('productProblem').value.trim(),priority:byId('productPriority').value,providers:collectProviders(),images:imageUrl?[{kind:'reference',sourceUrl:imageUrl,imageRights:byId('imageRights').value}]:[],ownerNotes:byId('ownerNotes').value.trim()};try{if(state.editingKey){await api('/api/intake/'+encodeURIComponent(state.editingKey),{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const wanted=byId('productStatus').value;const current=state.items.find((item)=>item.key===state.editingKey);if(current&&current.status!==wanted)await api('/api/intake/'+encodeURIComponent(state.editingKey)+'/status',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:wanted})})}else await api('/api/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});byId('productDialog').close();notify(state.editingKey?'Product updated':'Product added to the private pipeline');await load()}catch(error){notify(error.message,true)}}
  async function setOwnerStatus(item,status){try{await api('/api/intake/'+encodeURIComponent(item.key)+'/status',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status})});notify('Status updated');await load()}catch(error){notify(error.message,true)}}
  async function removeProduct(item){if(!confirm('Remove '+item.name+' from the private pipeline?'))return;try{await api('/api/intake/'+encodeURIComponent(item.key),{method:'DELETE'});notify('Product removed');await load()}catch(error){notify(error.message,true)}}
  function selectedAffiliateItem(){return state.items.find((item)=>item.key===state.affiliateKey)}
  function loadAffiliateFields(){const item=selectedAffiliateItem();const retailer=byId('affiliateRetailer').value;const saved=item?.affiliateLinks?.[retailer];byId('affiliateUrl').value=saved?.url||'';byId('affiliateStatus').value=saved?.status||'pending';byId('removeAffiliateBtn').disabled=!saved}
  function openAffiliate(item){state.affiliateKey=item.key;byId('affiliateProduct').value=item.name;fillSelect(byId('affiliateRetailer'),(item.providers||[]).map((provider)=>provider.retailer),(item.providers||[])[0]?.retailer);loadAffiliateFields();byId('affiliateDialog').showModal()}
  async function saveAffiliate(event){event.preventDefault();const status=byId('affiliateStatus').value;if(status==='verified'&&!confirm('I checked this exact affiliate URL and want it used on the next public site build. Continue?'))return;try{await api('/api/affiliate-link',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({productKey:state.affiliateKey,retailer:byId('affiliateRetailer').value,url:byId('affiliateUrl').value.trim(),status})});byId('affiliateDialog').close();notify(status==='verified'?'Verified affiliate link saved':'Affiliate link saved as pending');await load()}catch(error){notify(error.message,true)}}
  async function removeAffiliate(){const retailer=byId('affiliateRetailer').value;if(!confirm('Remove the saved affiliate link for '+retailer+'?'))return;try{await api('/api/affiliate-link?productKey='+encodeURIComponent(state.affiliateKey)+'&retailer='+encodeURIComponent(retailer),{method:'DELETE'});byId('affiliateDialog').close();notify('Affiliate link removed');await load()}catch(error){notify(error.message,true)}}
  async function dispatchAll(){try{const result=await api('/api/intake/dispatch',{method:'POST'});notify(result.dispatched.length?('Dispatched '+result.dispatched.length+' product(s)'):'No new products to dispatch');await load()}catch(error){notify(error.message,true)}}
  fillSelect(byId('statusFilter'),['all',...STATUSES],'all');byId('statusFilter').options[0].textContent='All statuses';fillSelect(byId('productPriority'),PRIORITIES,'medium');fillSelect(byId('imageRights'),RIGHTS,'SOURCE_LINK_ONLY');
  byId('addProductBtn').addEventListener('click',()=>openProduct());byId('addProviderBtn').addEventListener('click',()=>addProviderRow({}));byId('productForm').addEventListener('submit',saveProduct);byId('affiliateForm').addEventListener('submit',saveAffiliate);byId('affiliateRetailer').addEventListener('change',loadAffiliateFields);byId('removeAffiliateBtn').addEventListener('click',removeAffiliate);byId('dispatchBtn').addEventListener('click',dispatchAll);byId('refreshBtn').addEventListener('click',load);byId('search').addEventListener('input',render);byId('statusFilter').addEventListener('change',render);
  for(const id of ['closeProductBtn','cancelProductBtn'])byId(id).addEventListener('click',()=>byId('productDialog').close());for(const id of ['closeAffiliateBtn','cancelAffiliateBtn'])byId(id).addEventListener('click',()=>byId('affiliateDialog').close());
  load();
</script></body></html>`;
