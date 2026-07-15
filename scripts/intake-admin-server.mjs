// Product Intake dashboard — dev-only local control panel (Task A7).
//
//   npm run intake:admin      then open http://127.0.0.1:4317
//
// A standalone Node HTTP server (no deps) that reads/writes data/product-intake.json via the
// FileIntakeSource port. It is NOT part of the site's Cloudflare Worker build — the deployed
// site never exposes it — and it binds to 127.0.0.1 only. This is the write path the Worker
// runtime cannot provide (no filesystem). Use it to add, dispatch, and remove products.

import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { FileIntakeSource } from './intake-source.mjs';
import { PRIORITY, IMAGE_RIGHTS, DELEGATION_KEYS } from './intake-constants.mjs';

const HOST = '127.0.0.1';
const PORT = Number(process.env.INTAKE_ADMIN_PORT) || 4317;
const src = new FileIntakeSource();

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(PAGE);
    }

    if (req.method === 'GET' && url.pathname === '/api/intake') {
      return json(res, 200, await src.list());
    }

    if (req.method === 'POST' && url.pathname === '/api/intake') {
      const b = await readBody(req);
      if (!b) return json(res, 400, { error: 'invalid JSON body' });
      const items = await src.list();
      const item = {
        intakeId: nextIntakeId(items),
        name: (b.name || '').trim(),
        category: (b.category || '').trim(),
        problemHypothesis: (b.problemHypothesis || '').trim(),
        providers: [
          {
            retailer: (b.retailer || '').trim(),
            productUrl: (b.productUrl || '').trim(),
            affiliateKeyRef: (b.affiliateKeyRef || '').trim(),
          },
        ],
        images: b.imageSourceUrl
          ? [{ kind: 'reference', sourceUrl: b.imageSourceUrl.trim(), imageRights: b.imageRights || 'SOURCE_LINK_ONLY' }]
          : [],
        ownerNotes: (b.ownerNotes || '').trim(),
        priority: b.priority || 'medium',
        status: 'new',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      try {
        await src.add(item);
        return json(res, 201, { ok: true, item });
      } catch (e) {
        return json(res, 400, { error: e.message });
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/intake/dispatch') {
      const pending = await src.listPending();
      for (const it of pending) await src.dispatch(it.intakeId);
      return json(res, 200, { ok: true, dispatched: pending.map((i) => i.intakeId) });
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/intake/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/intake/'.length));
      try {
        await src.remove(id);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 404, { error: e.message });
      }
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

// Export the wiring for tests; only listen when run directly.
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
<title>Setup Sahla — Product Intake</title>
<style>
  :root{--ink:#101411;--paper:#E9DFCA;--lime:#C9FF4A;--cyan:#66D9E8;--cream:#FFFDF7;--muted:#3B443E}
  *{box-sizing:border-box}
  body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--cream)}
  header{background:var(--ink);color:var(--cream);padding:20px 28px;display:flex;align-items:baseline;gap:14px}
  header h1{margin:0;font-size:20px;letter-spacing:.2px}
  header span{color:var(--lime);font-weight:600}
  header small{color:#b9c3ba;margin-left:auto}
  main{max-width:1080px;margin:0 auto;padding:24px 20px 60px}
  .grid{display:grid;grid-template-columns:1fr 1.3fr;gap:24px}
  @media(max-width:840px){.grid{grid-template-columns:1fr}}
  .card{background:var(--cream);border:1px solid var(--paper);border-radius:14px;padding:20px;box-shadow:0 1px 0 rgba(16,20,17,.04)}
  .card h2{margin:0 0 14px;font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
  label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin:12px 0 4px}
  input,select,textarea{width:100%;padding:9px 11px;border:1px solid #cdc4ad;border-radius:9px;background:#fff;font:inherit;color:var(--ink)}
  textarea{min-height:60px;resize:vertical}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  button{cursor:pointer;border:0;border-radius:9px;font:inherit;font-weight:700;padding:10px 16px}
  .primary{background:var(--lime);color:var(--ink)}
  .ghost{background:transparent;border:1px solid #cdc4ad;color:var(--ink);font-weight:600}
  .bar{display:flex;gap:10px;align-items:center;margin-bottom:14px}
  .bar h2{margin:0}
  table{width:100%;border-collapse:collapse;font-size:13.5px}
  th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--paper);vertical-align:top}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
  .pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}
  .s-new{background:#e6e0cd;color:#5b5330}.s-dispatched{background:var(--cyan);color:#06323a}
  .s-ready{background:var(--lime);color:#213000}.s-promoted{background:#1f6b2e;color:#eafce9}
  .deleg{font-size:11px;color:var(--muted)}
  .x{color:#8a2b2b;background:transparent;border:0;font-weight:700;cursor:pointer;padding:2px 6px}
  .note{font-size:12px;color:var(--muted);margin-top:6px}
  .err{background:#fdecec;color:#7a1f1f;border:1px solid #f2c2c2;border-radius:9px;padding:9px 11px;margin-top:10px;white-space:pre-wrap;display:none}
</style></head><body>
<header><h1>Setup Sahla <span>Product Intake</span></h1><small>dev-only control panel · localhost</small></header>
<main>
  <div class="grid">
    <section class="card">
      <h2>Add a product</h2>
      <label>Product name</label><input id="name" placeholder="Ugreen Revodok 105 USB-C Hub">
      <div class="row"><div><label>Category</label><input id="category" placeholder="Ports and connectivity"></div>
      <div><label>Priority</label><select id="priority"></select></div></div>
      <label>Problem it solves (hypothesis)</label><textarea id="problemHypothesis" placeholder="Budget 5-in-1 alternative to the Anker 332."></textarea>
      <label>Retailer</label><input id="retailer" placeholder="Amazon Egypt">
      <label>Public product URL</label><input id="productUrl" placeholder="https://www.amazon.eg/-/en/dp/...">
      <label>Affiliate key (vault reference — NOT a URL)</label><input id="affiliateKeyRef" placeholder="amazonEgypt.ugreen-revodok-105">
      <div class="note">Your real affiliate link lives in .vault/secrets.local.json under this key. Never paste the tracking URL here.</div>
      <div class="row"><div><label>Image reference URL (optional)</label><input id="imageSourceUrl" placeholder="https://..."></div>
      <div><label>Image rights</label><select id="imageRights"></select></div></div>
      <label>Owner notes</label><textarea id="ownerNotes" placeholder="Verify USB-C video support."></textarea>
      <div style="margin-top:16px;display:flex;gap:10px"><button class="primary" onclick="add()">Add to queue</button></div>
      <div id="err" class="err"></div>
    </section>
    <section class="card">
      <div class="bar"><h2>Queue</h2><button class="ghost" onclick="dispatch()" style="margin-left:auto">Dispatch all new</button><button class="ghost" onclick="load()">Refresh</button></div>
      <table><thead><tr><th>ID</th><th>Product</th><th>Status</th><th>Delegations</th><th></th></tr></thead><tbody id="rows"></tbody></table>
      <div id="empty" class="note">Queue is empty.</div>
    </section>
  </div>
</main>
<script>
  const KEYS=${JSON.stringify(DELEGATION_KEYS)};
  for(const [id,list,def] of [['priority',${JSON.stringify(PRIORITY)},'medium'],['imageRights',${JSON.stringify(IMAGE_RIGHTS)},'SOURCE_LINK_ONLY']]){
    const el=document.getElementById(id); el.innerHTML=list.map(v=>'<option'+(v===def?' selected':'')+'>'+v+'</option>').join('');
  }
  async function load(){
    const items=await (await fetch('/api/intake')).json();
    const rows=document.getElementById('rows'); const empty=document.getElementById('empty');
    empty.style.display=items.length?'none':'block';
    rows.innerHTML=items.map(function(i){
      const d=i.delegations||{}; const deleg=KEYS.map(function(k){return k[0].toUpperCase()+':'+((d[k]||'-'))}).join('  ');
      return '<tr><td>'+i.intakeId+'</td><td><strong>'+esc(i.name)+'</strong><br><span class="deleg">'+esc(i.providers&&i.providers[0]?i.providers[0].retailer:'')+'</span></td>'+
        '<td><span class="pill s-'+i.status+'">'+i.status+'</span></td><td class="deleg">'+deleg+'</td>'+
        '<td><button class="x" title="Remove" onclick="del(\\''+i.intakeId+'\\')">✕</button></td></tr>';
    }).join('');
  }
  function esc(s){return String(s||'').replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function val(id){return document.getElementById(id).value}
  async function add(){
    const err=document.getElementById('err'); err.style.display='none';
    const body={name:val('name'),category:val('category'),problemHypothesis:val('problemHypothesis'),priority:val('priority'),
      retailer:val('retailer'),productUrl:val('productUrl'),affiliateKeyRef:val('affiliateKeyRef'),
      imageSourceUrl:val('imageSourceUrl'),imageRights:val('imageRights'),ownerNotes:val('ownerNotes')};
    const r=await fetch('/api/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const j=await r.json();
    if(!r.ok){err.textContent=j.error||'error';err.style.display='block';return}
    for(const id of ['name','category','problemHypothesis','retailer','productUrl','affiliateKeyRef','imageSourceUrl','ownerNotes'])document.getElementById(id).value='';
    load();
  }
  async function del(id){ if(!confirm('Remove '+id+'?'))return; await fetch('/api/intake/'+encodeURIComponent(id),{method:'DELETE'}); load(); }
  async function dispatch(){ await fetch('/api/intake/dispatch',{method:'POST'}); load(); }
  load();
</script></body></html>`;
