import { BaobabLogo } from './BaobabLogo';
import { Link } from 'react-router-dom';

const footerLinks = {
  'About Pumzika': [
    { label: 'How it works', to: '/' },
    { label: 'Newsroom', to: '/' },
    { label: 'Careers', to: '/' },
  ],
  Hosting: [
    { label: 'Become a Host', to: '/become-host' },
    { label: 'Host resources', to: '/' },
    { label: 'Community forum', to: '/' },
  ],
  Support: [
    { label: 'Help center', to: '/' },
    { label: 'Safety info', to: '/' },
    { label: 'Cancellation', to: '/' },
  ],
};

export const Footer = () => (
  <footer className="mt-24 border-t border-border bg-card">
    <div className="container py-12 md:py-16">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <BaobabLogo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your home across Tanzania. Discover curated stays from Zanzibar to Kilimanjaro.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="mb-3 font-body text-sm font-semibold text-foreground">{title}</h4>
            <ul className="space-y-2">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Pumzika. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Sitemap</span>
          <span>EN / SW</span>
          <span>TSh / USD</span>
        </div>
      </div>
    </div>
  </footer>
);
