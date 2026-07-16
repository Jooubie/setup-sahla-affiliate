"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/products/", label: "Product fits" },
  { href: "/guides/", label: "Fix-it guides" },
  { href: "/research/", label: "Research" },
  { href: "/methodology/", label: "Method" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-link" aria-label="Setup Sahla home">
          <Image src="/brand-logo.svg" alt="Setup Sahla" width={188} height={48} priority unoptimized />
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href || pathname.startsWith(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="cable-route" aria-hidden="true"><span /></div>
      <div className="site-footer__grid">
        <div>
          <Image src="/brand-logo.svg" alt="Setup Sahla" width={188} height={48} unoptimized />
          <p>Fix the friction. Keep the gear.</p>
          <p className="fine-print">Egypt-first, evidence-dated setup guidance. Editorial launch snapshot: 15 July 2026.</p>
        </div>
        <div>
          <p className="footer-label">Read</p>
          <Link href="/products/">Product fits</Link>
          <Link href="/guides/">Fix-it guides</Link>
          <Link href="/research/">Research room</Link>
        </div>
        <div>
          <p className="footer-label">Trust</p>
          <Link href="/about/">About</Link>
          <Link href="/methodology/">Methodology</Link>
          <Link href="/disclosure/">Disclosure</Link>
          <Link href="/privacy/">Privacy</Link>
        </div>
      </div>
      <p className="footer-bottom">© 2026 Setup Sahla. Product names belong to their respective owners.</p>
    </footer>
  );
}
