import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Handshake,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { OrganizationFooter as SharedOrganizationFooter, OrganizationHeader as SharedOrganizationHeader } from '@/components/organization/OrganizationPublicChrome';
import NotFoundPage from '@/pages/not-found';
import {
  orgHomeService,
  type OrgHomePublicData,
  type OrgHomeSection,
} from '@/services/orgHomeService';
import './org-home-fonts.css';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function asArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.map(asObject) : [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') return response.data.message;
  }
  return 'Não foi possível carregar a página pública desta organização.';
}

function sectionItems(section: OrgHomeSection & { items?: JsonObject[] }): JsonObject[] {
  return section.items ?? asArray(section.config.items);
}

function sectionAnchor(type: string): string {
  return type.toLowerCase();
}

function PublicLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  if (to.startsWith('/')) {
    return <Link className={className} to={to}>{children}</Link>;
  }
  return <a className={className} href={to} rel={to.startsWith('https://') ? 'noopener noreferrer' : undefined}>{children}</a>;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function CountUp({ value }: { value: string }) {
  const reducedMotion = useReducedMotion();
  const numericValue = Number(value.replace(/[^\d]/g, ''));
  const [current, setCurrent] = useState(reducedMotion || !Number.isFinite(numericValue) ? value : '0');

  useEffect(() => {
    if (reducedMotion || !Number.isFinite(numericValue) || numericValue <= 0) {
      setCurrent(value);
      return;
    }
    let frame = 0;
    const duration = 700;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCurrent(Math.floor(numericValue * progress).toLocaleString('pt-BR'));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, reducedMotion, value]);

  return <span>{current}</span>;
}

function HomeSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#020617] p-6 text-slate-100" aria-label="Carregando página">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-14 rounded-xl bg-white/10" />
        <div className="grid min-h-[460px] gap-8 lg:grid-cols-2">
          <div className="space-y-5 self-center">
            <div className="h-5 w-48 rounded bg-white/10" />
            <div className="h-16 max-w-2xl rounded bg-white/10" />
            <div className="h-24 max-w-xl rounded bg-white/10" />
            <div className="h-12 w-44 rounded-xl bg-white/10" />
          </div>
          <div className="rounded-3xl bg-white/[0.06]" />
        </div>
      </div>
    </main>
  );
}

export default function OrganizationLanding() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [home, setHome] = useState<OrgHomePublicData | null>(null);
  const [homeError, setHomeError] = useState('');
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!tenant) {
      setHome(null);
      return;
    }
    let active = true;
    setHome(null);
    setHomeError('');
    orgHomeService.getPublic(tenant.slug)
      .then((data) => {
        if (active) setHome(data);
      })
      .catch((error: unknown) => {
        if (active) setHomeError(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [tenant?.slug]);

  const sections = useMemo(
    () => home?.sections.filter((section) => section.type !== 'PARCEIROS' || home.features.includes('sponsors'))
      .filter((section) => section.type !== 'TALENTOS' || home.features.includes('talent_network')) ?? [],
    [home],
  );
  const hero = sections.find((section) => section.type === 'HERO');
  const heroSlides = asArray(asObject(hero?.config).slides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);

  useEffect(() => {
    setActiveSlide(0);
  }, [home?.organization.id]);

  useEffect(() => {
    if (reducedMotion || pauseCarousel || heroSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length, pauseCarousel, reducedMotion]);

  useEffect(() => {
    if (!home) return;
    const seo = home.config.seo;
    const previousTitle = document.title;
    const cleanup: Array<() => void> = [];
    document.title = seo.title || home.organization.name;
    const description = seo.description || asString(home.sections.find((section) => section.type === 'HERO')?.subtitle);
    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      const existing = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const element = existing ?? document.createElement('meta');
      const previous = element.content;
      element.setAttribute(attribute, key);
      element.content = content;
      if (!existing) document.head.append(element);
      cleanup.push(() => { if (existing) element.content = previous; else element.remove(); });
    };
    const setLink = (rel: string, href: string) => {
      const existing = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      const element = existing ?? document.createElement('link');
      const previous = element.getAttribute('href');
      element.rel = rel;
      element.href = href;
      if (!existing) document.head.append(element);
      cleanup.push(() => {
        if (!existing) element.remove();
        else if (previous === null) element.removeAttribute('href');
        else element.setAttribute('href', previous);
      });
    };
    const pageUrl = window.location.href.split('#')[0];
    const imageUrl = seo.og_image_url ? new URL(seo.og_image_url, window.location.origin).href : '';
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', seo.title || home.organization.name);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:image', imageUrl);
    setLink('canonical', pageUrl);
    if (home.config.theme.favicon_url) setLink('icon', home.config.theme.favicon_url);
    return () => { document.title = previousTitle; cleanup.forEach(restore => restore()); };
  }, [home]);

  if (tenantLoading || (tenant && !home && !homeError)) return <HomeSkeleton />;
  if (!tenant) {
    return <NotFoundPage />;
  }
  if (!home) {
    return <NotFoundPage title="Página pública indisponível" message={homeError || 'A home desta organização ainda não foi publicada.'} />;
  }

  const { organization, config } = home;
  const theme = config.theme;
  const primaryColor = theme.primary_color || '#0e79b2';
  const backgroundColor = theme.background_color || '#020617';
  const menuItems = [
    { label: 'Institucional', type: 'CAMINHOS' },
    { label: 'Agenda', type: 'AGENDA' },
    { label: 'Notícias', type: 'NOTICIAS' },
    { label: 'Parceiros', type: 'PARCEIROS' },
    { label: 'Contato', type: 'CONTATO' },
  ].filter((item) => sections.some((section) => section.type === item.type));

  return (
    <main
      id="inicio"
      className="min-h-screen overflow-hidden text-slate-100"
      style={{ backgroundColor, fontFamily: `"${theme.font_family || 'Inter'}", sans-serif` }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: organization.name,
            url: window.location.origin,
            email: config.contact.email,
            telephone: config.contact.phone,
            address: config.contact.address,
          }).replace(/</g, '\\u003c'),
        }}
      />
      <OrganizationHeader
        organizationName={organization.name}
        logoUrl={theme.logo_url}
        sections={sections}
        menuItems={menuItems}
        primaryColor={primaryColor}
      />

      {hero && heroSlides.length > 0 && (
        <section
          aria-label="Apresentação da organização"
          className="relative isolate min-h-[620px] scroll-mt-24 border-b border-white/5"
          id={sectionAnchor(hero.type)}
          onMouseEnter={() => setPauseCarousel(true)}
          onMouseLeave={() => setPauseCarousel(false)}
          onFocus={() => setPauseCarousel(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPauseCarousel(false);
          }}
          style={{
            backgroundImage: `radial-gradient(ellipse at 78% 12%, ${primaryColor}48, transparent 45%), linear-gradient(135deg, ${backgroundColor} 15%, ${theme.secondary_color || '#0d1b2a'} 100%)`,
          }}
        >
          <div className="pointer-events-none absolute -left-40 top-24 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.9fr]">
            <HeroContent
              section={hero}
              slide={heroSlides[Math.min(activeSlide, heroSlides.length - 1)]}
              primaryColor={primaryColor}
            />
            <div className="relative mx-auto w-full max-w-xl">
              {heroSlides.length > 1 && (
                <div className="absolute right-3 top-3 z-10 flex gap-2">
                  <button
                    className="rounded-full border border-white/20 bg-black/50 p-2 text-white outline-none transition hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Banner anterior"
                    onClick={() => setActiveSlide((index) => (index - 1 + heroSlides.length) % heroSlides.length)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-full border border-white/20 bg-black/50 p-2 text-white outline-none transition hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Próximo banner"
                    onClick={() => setActiveSlide((index) => (index + 1) % heroSlides.length)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <HeroMedia slide={heroSlides[Math.min(activeSlide, heroSlides.length - 1)]} />
              {heroSlides.length > 1 && (
                <div className="mt-4 flex justify-center gap-2" aria-label="Escolher banner">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={`${asString(slide.title)}-${index}`}
                      aria-label={`Mostrar banner ${index + 1}`}
                      aria-current={index === activeSlide}
                      className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                        index === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                      }`}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-6">
        {sections.filter((section) => section.type !== 'HERO').map((section) => (
          <HomeSection
            key={section.id}
            section={section}
            organizationName={organization.name}
            primaryColor={primaryColor}
            contact={config.contact}
            socialLinks={config.social_links}
            features={home.features}
          />
        ))}
      </div>

      <OrganizationFooter
        organizationName={organization.name}
        contact={config.contact}
        socialLinks={config.social_links}
        sections={sections}
      />
    </main>
  );
}

function OrganizationHeader(props: {
  organizationName: string;
  logoUrl?: string | null;
  sections: OrgHomePublicData['sections'];
  menuItems: Array<{ label: string; type: string }>;
  primaryColor: string;
}) {
  return <SharedOrganizationHeader {...props} />;
}

function HeroContent({
  section,
  slide,
  primaryColor,
}: {
  section: OrgHomeSection;
  slide: JsonObject;
  primaryColor: string;
}) {
  const sectionTitle = section.title || asString(slide.title);
  const title = asString(slide.title) || sectionTitle;
  const description = asString(slide.description) || section.subtitle;
  const buttonText = asString(slide.button_text) || 'Quero fazer parte';
  const buttonUrl = asString(slide.button_url) || '/cadastro';

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
      {description && <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{description}</p>}
      <div className="mt-9 flex flex-wrap gap-3">
        <PublicLink
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          to={buttonUrl}
        >
          {buttonText} <ArrowRight className="h-4 w-4" />
        </PublicLink>
        <Link
          className="inline-flex items-center rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          to="/login"
        >
          Área do associado
        </Link>
      </div>
      <div className="mt-8 h-1 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
    </div>
  );
}

function HeroMedia({ slide }: { slide: JsonObject }) {
  const imageUrl = asString(slide.image_url);
  const videoUrl = asString(slide.video_url);
  if (videoUrl) {
    return (
      <video
        className="aspect-[4/3] w-full rounded-3xl border border-white/10 object-cover shadow-2xl"
        src={videoUrl}
        poster={imageUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-label={asString(slide.image_alt) || asString(slide.title)}
      />
    );
  }
  if (imageUrl) {
    return (
      <img
        className="aspect-[4/3] w-full rounded-3xl border border-white/10 object-cover shadow-2xl"
        src={imageUrl}
        alt={asString(slide.image_alt) || asString(slide.title)}
        loading="eager"
        decoding="async"
      />
    );
  }
  return (
    <div className="grid aspect-[4/3] place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-white/[0.03] shadow-2xl">
      <div className="max-w-xs space-y-4 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-white/15 bg-white/10 text-blue-200">
          <Users className="h-10 w-10" />
        </span>
        <p className="text-sm text-slate-300">Um espaço para conectar pessoas e ideias.</p>
      </div>
    </div>
  );
}

function HomeSection({
  section,
  organizationName,
  primaryColor,
  contact,
  socialLinks,
  features,
}: {
  section: OrgHomePublicData['sections'][number];
  organizationName: string;
  primaryColor: string;
  contact: OrgHomePublicData['config']['contact'];
  socialLinks: Record<string, string>;
  features: string[];
}) {
  const items = sectionItems(section);
  const heading = section.title || section.type;
  const iconMap: Record<string, typeof Users> = {
    Users,
    Handshake,
    HeartHandshake,
    CalendarDays,
    BriefcaseBusiness,
    Rocket,
    Sparkles,
  };

  if (section.type === 'CAMINHOS' || section.type === 'VANTAGENS') {
    const visibleItems = items.filter((item) => {
      const url = asString(item.url);
      if (url.startsWith('/talentos') && !features.includes('talent_network')) return false;
      if (url.startsWith('/parceiros') && !features.includes('sponsors')) return false;
      return true;
    });
    if (visibleItems.length === 0) return null;
    return (
      <section className="scroll-mt-24 border-b border-white/5 py-20" id={sectionAnchor(section.type)}>
        <SectionHeading title={heading} subtitle={section.subtitle} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((item, index) => {
            const Icon = iconMap[asString(item.icon)] ?? (section.type === 'CAMINHOS' ? Users : Sparkles);
            const url = asString(item.url);
            return (
              <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]" key={`${asString(item.title)}-${index}`}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-blue-200" style={{ color: primaryColor }}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{asString(item.title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{asString(item.description)}</p>
                {url && (
                  <PublicLink className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition group-hover:text-blue-200" to={url}>
                    Saiba mais <ArrowRight className="h-4 w-4" />
                  </PublicLink>
                )}
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (section.type === 'NUMEROS') {
    if (items.length === 0) return null;
    return (
      <section className="scroll-mt-24 border-b border-white/5 py-16" id={sectionAnchor(section.type)}>
        <SectionHeading title={heading} subtitle={section.subtitle} centered />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center" key={`${asString(item.label)}-${index}`}>
              <p className="text-3xl font-bold text-white">
                <CountUp value={asString(item.value)} />
              </p>
              <p className="mt-2 text-sm text-slate-300">{asString(item.label)}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'AGENDA' || section.type === 'NOTICIAS') {
    if (items.length === 0) return null;
    const isAgenda = section.type === 'AGENDA';
    return (
      <section className="scroll-mt-24 border-b border-white/5 py-20" id={sectionAnchor(section.type)}>
        <SectionHeading title={heading} subtitle={section.subtitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const location = [asString(item.location_city), asString(item.location_state)]
              .filter(Boolean)
              .join(', ');
            return (
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]" key={asString(item.id)}>
              {asString(item.cover_url) && (
                <img className="aspect-[16/10] w-full object-cover" src={asString(item.cover_url)} alt="" loading="lazy" decoding="async" />
              )}
              <div className="p-5">
                {isAgenda && (
                  <span className="inline-flex rounded-full bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                    {new Date(String(item.start_date)).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                  </span>
                )}
                <h3 className="mt-3 text-lg font-semibold">{asString(item.title)}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{asString(item.description)}</p>
                {isAgenda && location && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {location}
                  </p>
                )}
                {isAgenda && asString(item.public_slug) && (
                  <Link
                    className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                    to={`/eventos/${encodeURIComponent(asString(item.public_slug))}`}
                  >
                    Inscreva-se <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (section.type === 'PARCEIROS') {
    if (items.length === 0 || !features.includes('sponsors')) return null;
    const buttonText = asString(asObject(section.config).button_text) || 'Conheça nossos parceiros';
    return (
      <section className="scroll-mt-24 border-b border-white/5 py-16" id={sectionAnchor(section.type)}>
        <SectionHeading title={heading} subtitle={section.subtitle} centered />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {items.map((item) => {
            const logo = asString(item.logo_url);
            const card = (
              <div className="grid min-h-24 min-w-36 place-items-center rounded-xl border border-white/10 bg-white/[0.04] p-4">
                {logo ? (
                  <img className="max-h-14 max-w-40 object-contain" src={logo} alt={asString(item.image_alt) || asString(item.name)} loading="lazy" decoding="async" />
                ) : (
                  <span className="font-medium text-slate-200">{asString(item.name)}</span>
                )}
              </div>
            );
            return asString(item.url)
              ? <a href={asString(item.url)} key={asString(item.name)} rel="noopener noreferrer" target="_blank">{card}</a>
              : <div key={asString(item.name)}>{card}</div>;
          })}
        </div>
        <div className="mt-8 text-center">
          <Link className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5" to="/parceiros">
            {buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  if (section.type === 'TALENTOS') {
    if (!features.includes('talent_network') || section.show_button === false) return null;
    const description = asString(asObject(section.config).description) || section.subtitle;
    const buttonText = asString(asObject(section.config).button_text) || 'Conheça os talentos';
    return (
      <section className="scroll-mt-24 border-b border-white/5 py-16" id={sectionAnchor(section.type)}>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-white/[0.02] p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Rede de talentos</p>
          <h2 className="mt-4 text-3xl font-bold">{heading}</h2>
          {description && <p className="mt-4 max-w-2xl leading-7 text-slate-300">{description}</p>}
          <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-blue-100" to="/talentos">
            {buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  if (section.type === 'CONTATO') {
    const hasContact = Object.values(contact).some(Boolean) || Object.values(socialLinks).some(Boolean);
    if (!hasContact) return null;
    return (
      <section className="scroll-mt-24 py-20" id="contato">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading title={heading || 'Entre em contato'} subtitle={section.subtitle} />
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Quer saber mais sobre {organizationName}? Fale com a equipe da organização.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {contact.email && <ContactItem icon={Mail} label="Email" href={`mailto:${contact.email}`} value={contact.email} />}
            {contact.phone && <ContactItem icon={Phone} label="Telefone" href={`tel:${contact.phone}`} value={contact.phone} />}
            {contact.whatsapp && <ContactItem icon={Phone} label="WhatsApp" href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} value={contact.whatsapp} />}
            {contact.address && (
              <ContactItem icon={MapPin} label="Endereço" href={contact.map_url} value={contact.address} />
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
}

function SectionHeading({
  title,
  subtitle,
  centered = false,
}: {
  title: string;
  subtitle: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 leading-7 text-slate-300">{subtitle}</p>}
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  href,
  value,
}: {
  icon: typeof Mail;
  label: string;
  href?: string;
  value: string;
}) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-slate-400">{label}</span>
        <span className="mt-1 block break-words text-sm font-medium text-slate-100">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" href={href}>
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">{content}</div>
  );
}

function OrganizationFooter({
  organizationName,
  contact,
  socialLinks,
  sections,
}: {
  organizationName: string;
  contact: OrgHomePublicData['config']['contact'];
  socialLinks: Record<string, string>;
  sections: OrgHomePublicData['sections'];
}) {
  return <SharedOrganizationFooter organizationName={organizationName} contact={contact} socialLinks={socialLinks} sections={sections} />;
}
