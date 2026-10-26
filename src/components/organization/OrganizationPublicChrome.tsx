import { Facebook, Instagram, Linkedin, MapPin, Youtube } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { OrgHomePublicData } from '@/services/orgHomeService';

function sectionAnchor(type: string): string {
  return type.toLowerCase();
}

export function OrganizationHeader({
  organizationName,
  logoUrl,
  sections,
  menuItems,
  primaryColor,
  homePath = '',
}: {
  organizationName: string;
  logoUrl?: string | null;
  sections: OrgHomePublicData['sections'];
  menuItems: Array<{ label: string; type: string }>;
  primaryColor: string;
  homePath?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canShowPartners = sections.some((section) => section.type === 'PARCEIROS');
  const links = [
    ...menuItems.map((item) => ({
      label: item.label,
      href: `${homePath}#${sectionAnchor(item.type)}`,
    })),
    ...(canShowPartners ? [{ label: 'Conheça os parceiros', href: '/parceiros' }] : []),
  ];
  const homeHref = `${homePath}#inicio`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020617]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link className="flex min-w-0 items-center gap-3" to={homeHref} aria-label={`${organizationName}, início`}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {organizationName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate text-base font-semibold sm:text-lg">{organizationName}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex" aria-label="Menu principal">
          {links.map((item) => item.href.startsWith('/') ? (
            <Link className="transition hover:text-white" key={item.href} to={item.href}>{item.label}</Link>
          ) : (
            <a className="transition hover:text-white" key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white" to="/login">
            Área do associado
          </Link>
          <Link
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ backgroundColor: primaryColor }}
            to="/cadastro"
          >
            Associe-se
          </Link>
        </div>

        <button
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="tenant-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Fechar menu' : 'Menu'}
        </button>
      </div>
      {menuOpen && (
        <nav id="tenant-mobile-menu" className="border-t border-white/10 bg-[#020617] px-6 py-4 lg:hidden" aria-label="Menu móvel">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {links.map((item) => item.href.startsWith('/') ? (
              <Link className="text-sm text-slate-200" key={item.href} to={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <a className="text-sm text-slate-200" key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link className="text-sm text-slate-200" to="/login">Área do associado</Link>
            <Link className="text-sm font-semibold text-blue-300" to="/cadastro">Associe-se</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function OrganizationFooter({
  organizationName,
  contact,
  socialLinks,
  sections,
  homePath = '',
}: {
  organizationName: string;
  contact: OrgHomePublicData['config']['contact'];
  socialLinks: Record<string, string>;
  sections: OrgHomePublicData['sections'];
  homePath?: string;
}) {
  const sectionLinks = sections
    .filter((section) => ['CAMINHOS', 'AGENDA', 'NOTICIAS', 'PARCEIROS', 'CONTATO'].includes(section.type))
    .map((section) => ({ label: section.title || section.type, href: `${homePath}#${sectionAnchor(section.type)}` }));
  const socialIconMap: Partial<Record<string, typeof Instagram>> = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    youtube: Youtube,
  };

  return (
    <footer className="border-t border-white/10 bg-[#020617] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{organizationName}</p>
          <div className="mt-5 flex gap-3">
            {Object.entries(socialLinks).map(([network, url]) => {
              const Icon = socialIconMap[network];
              return Icon && url ? (
                <a
                  aria-label={network}
                  className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  href={url}
                  key={network}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : null;
            })}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Navegação</h2>
          <nav className="mt-4 flex flex-col gap-3" aria-label="Links do rodapé">
            {sectionLinks.map((item) => item.href.startsWith('/') ? (
              <Link className="text-sm text-slate-400 hover:text-white" to={item.href} key={item.href}>{item.label}</Link>
            ) : (
              <a className="text-sm text-slate-400 hover:text-white" href={item.href} key={item.href}>{item.label}</a>
            ))}
            <Link className="text-sm text-slate-400 hover:text-white" to="/login">Área do associado</Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Contato</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            {contact.email && <p>{contact.email}</p>}
            {contact.phone && <p>{contact.phone}</p>}
            {contact.address && <p>{contact.address}</p>}
            {contact.map_url && <a className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200" href={contact.map_url} rel="noopener noreferrer" target="_blank">Ver no mapa <MapPin className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {organizationName}. Todos os direitos reservados.</span>
          <span>Powered by UseAyni</span>
        </div>
      </div>
    </footer>
  );
}