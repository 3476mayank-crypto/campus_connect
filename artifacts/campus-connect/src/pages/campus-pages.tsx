import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, ArrowUpRight, Bell, CalendarDays, Check, ChevronRight, Clock3, Compass,
  Filter, Mail, MapPin, Menu, Search, Sparkles, Users, X, Zap,
} from 'lucide-react';
import {
  useGetDashboardSummary, getGetDashboardSummaryQueryKey, useListClubs, getListClubsQueryKey,
  useGetClub, getGetClubQueryKey, useExpressClubInterest, useListEvents, getListEventsQueryKey,
  useGetEvent, getGetEventQueryKey, useRegisterForEvent, useListAnnouncements, getListAnnouncementsQueryKey,
} from '@workspace/api-client-react';
import type { Announcement, CampusEvent, Club } from '@workspace/api-client-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Compass },
  { href: '/clubs', label: 'Clubs', icon: Users },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/announcements', label: 'Announcements', icon: Bell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-border bg-card/90 px-5 py-6 backdrop-blur lg:flex">
        <Logo />
        <div className="mt-11">
          <p className="font-mono-ui mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Find your people</p>
          <NavLinks location={location} />
        </div>
        <div className="mt-auto rounded-2xl border border-border bg-muted/70 p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"><Sparkles size={15} /></div>
          <p className="text-sm font-bold">New here?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Start with a club, a calendar invite, or simply say hello.</p>
          <Link href="/clubs" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary" data-testid="link-sidebar-discover">Explore clubs <ArrowUpRight size={13} /></Link>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur lg:hidden">
        <Logo compact />
        <button className="rounded-lg p-2 hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" data-testid="button-mobile-menu">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      {mobileOpen && <div className="fixed inset-x-0 top-[72px] z-20 border-b border-border bg-card p-4 shadow-lg lg:hidden"><NavLinks location={location} onNavigate={() => setMobileOpen(false)} /></div>}
      <main className="min-h-[100dvh] lg:pl-[244px]">{children}</main>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><span className="absolute h-2 w-2 rounded-full bg-secondary" /><span className="absolute h-5 w-5 rounded-full border border-secondary/70" /></span>
    <span className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-[-.04em]`}>campus<span className="text-accent">.</span>connect</span>
  </Link>;
}

function NavLinks({ location, onNavigate }: { location: string; onNavigate?: () => void }) {
  return <nav className="space-y-1">{navItems.map(({ href, label, icon: Icon }) => {
    const active = href === '/' ? location === '/' : location.startsWith(href);
    return <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid={`link-nav-${label.toLowerCase()}`}>
      <Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-secondary" />}
    </Link>;
  })}</nav>;
}

function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div><p className="font-mono-ui mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-accent">{eyebrow}</p><h1 className="text-3xl font-bold tracking-[-.045em] md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>
    {children}
  </div>;
}

function LoadingCards({ count = 3 }: { count?: number }) { return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: count }, (_, i) => <div key={i} className="h-48 rounded-2xl border border-border bg-card p-5"><div className="skeleton h-3 w-16 rounded" /><div className="skeleton mt-7 h-6 w-4/5 rounded" /><div className="skeleton mt-3 h-3 w-full rounded" /><div className="skeleton mt-2 h-3 w-2/3 rounded" /></div>)}</div>; }
function QueryError({ label }: { label: string }) { return <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center"><p className="font-semibold">We couldn't load {label}.</p><p className="mt-1 text-sm text-muted-foreground">Try refreshing in a moment.</p></div>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary"><Search size={18} /></div><p className="mt-4 font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }

function SectionHeading({ eyebrow, title, href, linkLabel = 'See all' }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return <div className="mb-4 flex items-end justify-between"><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">{eyebrow}</p><h2 className="mt-1 text-xl font-bold tracking-[-.03em]">{title}</h2></div>{href && <Link href={href} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-accent" data-testid={`link-see-${title.toLowerCase().replaceAll(' ', '-')}`}>{linkLabel} <ChevronRight size={14} /></Link>}</div>;
}

function AccentMark({ accent, className = '' }: { accent: string; className?: string }) { return <span className={`block h-1.5 rounded-full ${className}`} style={{ backgroundColor: accent }} />; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{children}</span>; }
function formatDate(value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', options).format(date); }

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  return <AppShell><div className="page-grid min-h-[100dvh] px-5 py-8 md:px-10 md:py-10 xl:px-14">
    <div className="mx-auto max-w-[1280px]">
      <div className="animate-in mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono-ui mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-accent">Tuesday · your campus, in one place</p><h1 className="max-w-xl text-4xl font-bold leading-[.98] tracking-[-.06em] md:text-6xl">Make the most of<br /><span className="text-primary">your next hello.</span></h1></div><div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-secondary" /> Campus is buzzing</div></div>
      {isLoading ? <><div className="mb-10 grid gap-3 md:grid-cols-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div><LoadingCards /></> : isError || !data ? <QueryError label="your campus snapshot" /> : <>
        <div className="animate-in delay-1 mb-12 grid gap-3 md:grid-cols-3">
          <StatCard label="Clubs to find" value={data.clubCount} suffix="active groups" icon={<Users size={18} />} />
          <StatCard label="Events this season" value={data.eventCount} suffix="ways to show up" icon={<CalendarDays size={18} />} />
          <StatCard label="Students in the mix" value={data.activeStudents.toLocaleString()} suffix="and growing" icon={<Zap size={18} />} />
        </div>
        <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <section className="animate-in delay-2 mb-12"><SectionHeading eyebrow="People you might like" title="Featured clubs" href="/clubs" />
              {data.featuredClubs?.length ? <div className="grid gap-4 md:grid-cols-2">{data.featuredClubs.slice(0, 4).map(club => <ClubCard key={club.id} club={club} />)}</div> : <EmptyState title="No featured clubs yet" text="The directory is ready when you are." />}</section>
            <section className="animate-in delay-3"><SectionHeading eyebrow="Put it on your calendar" title="Coming up" href="/events" />
              {data.upcomingEvents?.length ? <div className="space-y-3">{data.upcomingEvents.slice(0, 4).map(event => <EventRow key={event.id} event={event} />)}</div> : <EmptyState title="A quiet week" text="Check back soon for new campus events." />}</section>
          </div>
          <aside className="animate-in delay-3">
            <SectionHeading eyebrow="From the student desk" title="Latest announcement" />
            {data.latestAnnouncement ? <AnnouncementFeature announcement={data.latestAnnouncement} /> : <EmptyState title="All clear" text="No new announcements right now." />}
            <div className="mt-8 rounded-2xl bg-primary p-5 text-primary-foreground"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-secondary">Quick start</p><p className="mt-3 text-xl font-bold leading-tight">Your campus is more than classes.</p><p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">One club or event is all it takes to find your corner of it.</p><Link href="/events" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground" data-testid="link-quick-start">Browse what’s on <ArrowUpRight size={14} /></Link></div>
          </aside>
        </div>
      </>}
    </div>
  </div></AppShell>;
}

function StatCard({ label, value, suffix, icon }: { label: string; value: string | number; suffix: string; icon: React.ReactNode }) { return <div className="lift rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p><span className="text-accent">{icon}</span></div><div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-bold tracking-[-.06em]">{value}</span><span className="text-xs text-muted-foreground">{suffix}</span></div></div>; }

function ClubCard({ club }: { club: Club }) { return <Link href={`/clubs/${club.id}`} className="lift group overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm" data-testid={`card-club-${club.id}`}><AccentMark accent={club.accent} className="mb-5 w-10 transition-all group-hover:w-full" /><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono-ui text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{club.shortName || club.category}</span>{club.featured && <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase">Featured</span>}</div><h3 className="mt-2 text-lg font-bold tracking-[-.03em]">{club.name}</h3></div><ArrowUpRight size={17} className="text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{club.description}</p><div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Users size={13} /> {club.memberCount} members</span><span className="font-semibold text-primary">Meet the club</span></div></Link>; }

function EventRow({ event }: { event: CampusEvent }) { return <Link href={`/events/${event.id}`} className="lift group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm" data-testid={`row-event-${event.id}`}><div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-center"><span className="font-mono-ui text-[10px] font-bold uppercase text-accent">{formatDate(event.date, { month: 'short' })}</span><span className="text-xl font-bold leading-none">{formatDate(event.date, { day: 'numeric' })}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="truncate font-bold">{event.title}</h3><span className="font-mono-ui text-[9px] uppercase tracking-widest text-muted-foreground">{event.category}</span></div><p className="mt-1 flex items-center gap-3 truncate text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 size={12} /> {event.time}</span><span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span></p></div><ChevronRight size={18} className="shrink-0 text-muted-foreground group-hover:text-accent" /></Link>; }

function AnnouncementFeature({ announcement }: { announcement: Announcement }) { return <div className={`rounded-2xl border p-5 shadow-sm ${announcement.urgent ? 'border-accent/40 bg-accent/5' : 'border-border bg-card'}`} data-testid={`card-announcement-${announcement.id}`}><div className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${announcement.urgent ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{announcement.kind}</span><span className="font-mono-ui text-[10px] text-muted-foreground">{formatDate(announcement.publishedAt)}</span></div><h3 className="mt-5 text-xl font-bold leading-tight tracking-[-.03em]">{announcement.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{announcement.body}</p><Link href="/announcements" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary" data-testid="link-all-announcements">Read all <ArrowUpRight size={13} /></Link></div>; }

export function ClubsPage() {
  const [q, setQ] = useState(''); const [category, setCategory] = useState(''); const [sort, setSort] = useState('popular');
  const params = { q: q || undefined, category: category || undefined, sort: sort as 'popular' | 'alphabetical' | 'newest' };
  const { data, isLoading, isError } = useListClubs(params, { query: { queryKey: getListClubsQueryKey(params) } });
  const categories = Array.from(new Set((data || []).map(c => c.category))).sort();
  return <AppShell><div className="min-h-[100dvh] px-5 py-8 md:px-10 md:py-10 xl:px-14"><div className="mx-auto max-w-[1180px]">
    <PageIntro eyebrow="The directory" title="Find your people." description="A quick scan of the groups, circles, and causes that make campus feel like yours." />
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs by name, purpose, or tag" className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-4 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-2" data-testid="input-club-search" /></label><div className="flex gap-2"><select value={category} onChange={e => setCategory(e.target.value)} className="h-11 min-w-[130px] rounded-xl border border-border bg-background px-3 text-sm outline-none" data-testid="select-club-category"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><select value={sort} onChange={e => setSort(e.target.value)} className="h-11 min-w-[130px] rounded-xl border border-border bg-background px-3 text-sm outline-none" data-testid="select-club-sort"><option value="popular">Most popular</option><option value="alphabetical">A–Z</option><option value="newest">Newest</option></select></div></div>
    {isLoading ? <LoadingCards count={6} /> : isError ? <QueryError label="clubs" /> : data?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map(club => <ClubCard key={club.id} club={club} />)}</div> : <EmptyState title="No clubs match that search" text="Try a broader keyword or clear the filters." />}
  </div></div></AppShell>;
}

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>(); const clubId = Number(id);
  const { data: club, isLoading, isError } = useGetClub(clubId, { query: { queryKey: getGetClubQueryKey(clubId) } }); const mutation = useExpressClubInterest();
  const [form, setForm] = useState({ studentName: '', studentEmail: '', note: '' }); const [message, setMessage] = useState('');
  if (isLoading) return <AppShell><div className="mx-auto max-w-4xl px-5 py-10"><div className="skeleton h-64 rounded-3xl" /><div className="skeleton mt-5 h-40 rounded-2xl" /></div></AppShell>;
  if (isError || !club) return <AppShell><div className="mx-auto max-w-4xl px-5 py-16"><QueryError label="this club" /></div></AppShell>;
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ id: club.id, data: form }, { onSuccess: result => setMessage(result.message), onError: () => setMessage('We could not send that just yet. Please try again.') }); };
  return <AppShell><div className="mx-auto max-w-[1080px] px-5 py-8 md:px-10 md:py-10"><Link href="/clubs" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-clubs"><ArrowLeft size={16} /> Back to clubs</Link>
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]"><div><div className="rounded-3xl border border-border bg-card p-7 md:p-10"><AccentMark accent={club.accent} className="mb-7 w-16" /><div className="flex flex-wrap items-center gap-2"><Tag>{club.category}</Tag>{club.featured && <Tag>Featured</Tag>}{club.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}</div><h1 className="mt-5 text-4xl font-bold tracking-[-.055em] md:text-5xl">{club.name}</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{club.description}</p><div className="mt-8 grid gap-5 border-t border-border pt-7 sm:grid-cols-2"><Info label="Why it exists" value={club.purpose} /><Info label="When they meet" value={club.meetingSchedule} /><Info label="Who can join" value={club.eligibility} /><Info label="How to join" value={club.membershipProcess || 'Reach out to the club to learn more.'} /></div></div></div>
      <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm"><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-accent">Make a move</p><h2 className="mt-2 text-xl font-bold">Interested in joining?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Leave your details and this club will know to look out for you.</p>{message ? <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4"><div className="flex items-center gap-2 font-semibold text-primary"><Check size={17} /> You’re on the list</div><p className="mt-2 text-sm text-muted-foreground">{message}</p></div> : <form onSubmit={submit} className="mt-5 space-y-3"><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Your name" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-interest-name" /><input required type="email" value={form.studentEmail} onChange={e => setForm({ ...form, studentEmail: e.target.value })} placeholder="College email" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-interest-email" /><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Anything you want them to know? (optional)" rows={3} className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-interest-note" /><button disabled={mutation.isPending} className="press flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-submit-interest">{mutation.isPending ? 'Sending…' : 'Express interest'} <ArrowUpRight size={15} /></button></form>}</div>
    </div></div></AppShell>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm leading-relaxed">{value}</p></div>; }

export function EventsPage() {
  const [q, setQ] = useState(''); const [category, setCategory] = useState(''); const [timeframe, setTimeframe] = useState('all');
  const params = { q: q || undefined, category: category || undefined, timeframe: timeframe as 'all' | 'this-week' | 'this-month' };
  const { data, isLoading, isError } = useListEvents(params, { query: { queryKey: getListEventsQueryKey(params) } });
  const categories = Array.from(new Set((data || []).map(e => e.category))).sort();
  return <AppShell><div className="min-h-[100dvh] px-5 py-8 md:px-10 md:py-10 xl:px-14"><div className="mx-auto max-w-[1180px]"><PageIntro eyebrow="The campus calendar" title="Show up for something." description="Talks, mixers, workshops, and the small moments that become your favorite stories." />
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search events by title, location, or organizer" className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" data-testid="input-event-search" /></label><div className="flex gap-2"><select value={category} onChange={e => setCategory(e.target.value)} className="h-11 min-w-[130px] rounded-xl border border-border bg-background px-3 text-sm" data-testid="select-event-category"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="h-11 min-w-[130px] rounded-xl border border-border bg-background px-3 text-sm" data-testid="select-event-timeframe"><option value="all">Any time</option><option value="this-week">This week</option><option value="this-month">This month</option></select></div></div>
    {isLoading ? <LoadingCards count={6} /> : isError ? <QueryError label="events" /> : data?.length ? <div className="space-y-3">{data.map(event => <EventRow key={event.id} event={event} />)}</div> : <EmptyState title="Nothing on the calendar yet" text="Try another filter or check back soon." />}
  </div></div></AppShell>;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>(); const eventId = Number(id); const { data: event, isLoading, isError } = useGetEvent(eventId, { query: { queryKey: getGetEventQueryKey(eventId) } }); const mutation = useRegisterForEvent();
  const [form, setForm] = useState({ studentName: '', studentEmail: '' }); const [message, setMessage] = useState('');
  if (isLoading) return <AppShell><div className="mx-auto max-w-4xl px-5 py-10"><div className="skeleton h-72 rounded-3xl" /></div></AppShell>;
  if (isError || !event) return <AppShell><div className="mx-auto max-w-4xl px-5 py-16"><QueryError label="this event" /></div></AppShell>;
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ id: event.id, data: form }, { onSuccess: result => setMessage(result.message), onError: () => setMessage('Registration could not be completed. Please try again.') }); };
  const soldOut = event.spotsLeft < 1;
  return <AppShell><div className="mx-auto max-w-[1080px] px-5 py-8 md:px-10 md:py-10"><Link href="/events" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-events"><ArrowLeft size={16} /> Back to events</Link><div className="grid gap-8 lg:grid-cols-[1fr_340px]"><div><div className="rounded-3xl border border-border bg-card p-7 md:p-10"><AccentMark accent={event.accent} className="mb-7 w-16" /><div className="flex flex-wrap items-center gap-2"><Tag>{event.category}</Tag>{event.featured && <Tag>Featured</Tag>}{event.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}</div><h1 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-.055em] md:text-5xl">{event.title}</h1><p className="mt-5 text-base leading-relaxed text-muted-foreground">{event.description}</p><div className="mt-8 grid gap-5 border-t border-border pt-7 sm:grid-cols-2"><Info label="Date" value={formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })} /><Info label="Time" value={event.time} /><Info label="Location" value={event.location} /><Info label="Hosted by" value={event.organizer} /></div></div></div><div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm"><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-accent">Save your seat</p><div className="mt-2 flex items-baseline justify-between"><h2 className="text-xl font-bold">Join this event</h2><span className={`text-xs font-bold ${event.spotsLeft < 10 ? 'text-accent' : 'text-muted-foreground'}`}>{event.spotsLeft} spots left</span></div>{message ? <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4"><div className="flex items-center gap-2 font-semibold text-primary"><Check size={17} /> You’re registered</div><p className="mt-2 text-sm text-muted-foreground">{message}</p></div> : soldOut ? <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">This event is full. Check the events directory for another way to spend your time.</div> : <form onSubmit={submit} className="mt-5 space-y-3"><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Your name" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-register-name" /><input required type="email" value={form.studentEmail} onChange={e => setForm({ ...form, studentEmail: e.target.value })} placeholder="College email" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-register-email" /><button disabled={mutation.isPending} className="press flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60" data-testid="button-register-event">{mutation.isPending ? 'Registering…' : 'Register for event'} <ArrowUpRight size={15} /></button></form>}</div></div></div></AppShell>;
}

export function AnnouncementsPage() {
  const { data, isLoading, isError } = useListAnnouncements({ query: { queryKey: getListAnnouncementsQueryKey() } });
  return <AppShell><div className="min-h-[100dvh] px-5 py-8 md:px-10 md:py-10 xl:px-14"><div className="mx-auto max-w-[920px]"><PageIntro eyebrow="Stay in the loop" title="Campus announcements." description="The useful stuff, in one quiet place. Updates from the people keeping campus moving." />{isLoading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div> : isError ? <QueryError label="announcements" /> : data?.length ? <div className="space-y-4">{data.map((announcement, i) => <AnnouncementCard key={announcement.id} announcement={announcement} featured={i === 0} />)}</div> : <EmptyState title="No announcements yet" text="When campus has something to share, it’ll land here." />}</div></div></AppShell>;
}

function AnnouncementCard({ announcement, featured }: { announcement: Announcement; featured?: boolean }) { return <article className={`rounded-2xl border p-6 md:p-7 ${announcement.urgent ? 'border-accent/40 bg-accent/5' : 'border-border bg-card'} ${featured ? 'shadow-sm' : ''}`} data-testid={`article-announcement-${announcement.id}`}><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${announcement.urgent ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{announcement.kind}</span><span className="font-mono-ui text-[10px] text-muted-foreground">{formatDate(announcement.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</span>{announcement.urgent && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent"><Zap size={11} /> Important</span>}</div><h2 className={`mt-5 font-bold tracking-[-.035em] ${featured ? 'text-2xl' : 'text-xl'}`}>{announcement.title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{announcement.body}</p></article>; }