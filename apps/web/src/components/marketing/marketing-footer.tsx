import Image from 'next/image';
import Link from 'next/link';

const productLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
] as const;

const companyLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const supportLinks = [
  { href: '/contact', label: 'Help' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
] as const;

const footerLinkClass =
  'text-supporting text-muted-foreground transition-[color,opacity] duration-150 hover:text-foreground';

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/images/image.png" alt="" width={32} height={32} className="size-8" />
              <span className="text-h4 font-semibold text-foreground">Nestora</span>
            </Link>
            <p className="mt-4 max-w-sm text-supporting text-muted-foreground">
              Hostel management software for universities. One platform for rooms, students, fees,
              and daily operations.
            </p>
          </div>
          <div>
            <h3 className="text-label font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-label font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-label font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-border pt-8 text-caption text-muted-foreground">
          © {year} Nestora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
