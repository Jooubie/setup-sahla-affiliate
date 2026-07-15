import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found cable-corner">
      <p className="eyebrow">404 · Connection not found</p>
      <h1>Page unplugged.</h1>
      <p className="lead">That route is not part of the Setup Sahla desk. The product fits and launch guides are still connected.</p>
      <div className="button-row">
        <Link href="/guides/laptop-desk-setup-diagnostic/" className="button button--signal">Run the desk diagnostic</Link>
        <Link href="/products/" className="button button--ink">See product fits</Link>
      </div>
    </section>
  );
}
