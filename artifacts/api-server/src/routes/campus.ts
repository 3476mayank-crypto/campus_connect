import { and, asc, desc, eq, gt } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ExpressClubInterestBody,
  ExpressClubInterestParams,
  ExpressClubInterestResponse,
  GetClubParams,
  GetClubResponse,
  GetDashboardSummaryResponse,
  GetEventParams,
  GetEventResponse,
  ListAnnouncementsResponse,
  ListClubsQueryParams,
  ListClubsResponse,
  ListEventsQueryParams,
  ListEventsResponse,
  RegisterForEventBody,
  RegisterForEventParams,
  RegisterForEventResponse,
} from "@workspace/api-zod";
import {
  announcementsTable,
  clubInterestsTable,
  clubsTable,
  db,
  eventRegistrationsTable,
  eventsTable,
} from "@workspace/db";

const router: IRouter = Router();

function parseId(value: string | string[]): number {
  return Number(Array.isArray(value) ? value[0] : value);
}

function toClub(club: typeof clubsTable.$inferSelect) {
  return {
    ...club,
    tags: club.tags ?? [],
  };
}

function toEvent(event: typeof eventsTable.$inferSelect) {
  return {
    ...event,
    tags: event.tags ?? [],
  };
}

function toAnnouncement(
  announcement: typeof announcementsTable.$inferSelect,
) {
  return {
    ...announcement,
    publishedAt: announcement.publishedAt.toISOString(),
  };
}

router.get("/dashboard-summary", async (_req, res): Promise<void> => {
  const [clubs, events, announcements] = await Promise.all([
    db.select().from(clubsTable).orderBy(desc(clubsTable.memberCount)),
    db.select().from(eventsTable).orderBy(asc(eventsTable.date)),
    db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.publishedAt)),
  ]);

  const summary = {
    clubCount: clubs.length,
    eventCount: events.length,
    activeStudents: 2840,
    featuredClubs: clubs.filter((club) => club.featured).slice(0, 3).map(toClub),
    upcomingEvents: events.filter((event) => event.date >= today()).slice(0, 4).map(toEvent),
    latestAnnouncement: announcements[0]
      ? toAnnouncement(announcements[0])
      : null,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/clubs", async (req, res): Promise<void> => {
  const query = ListClubsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { q, category, sort } = query.data;
  let clubs = await db.select().from(clubsTable);
  const normalizedQuery = q?.trim().toLowerCase();

  if (normalizedQuery) {
    clubs = clubs.filter((club) =>
      [club.name, club.category, club.description, ...(club.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }
  if (category) {
    clubs = clubs.filter((club) => club.category === category);
  }
  clubs.sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "newest") return b.id - a.id;
    return b.memberCount - a.memberCount;
  });

  res.json(ListClubsResponse.parse(clubs.map(toClub)));
});

router.get("/clubs/:id", async (req, res): Promise<void> => {
  const params = GetClubParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [club] = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, params.data.id));
  if (!club) {
    res.status(404).json({ error: "Club not found" });
    return;
  }

  res.json(GetClubResponse.parse(toClub(club)));
});

router.post("/clubs/:id/interest", async (req, res): Promise<void> => {
  const params = ExpressClubInterestParams.safeParse({
    id: parseId(req.params.id),
  });
  const body = ExpressClubInterestBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [club] = await db
    .select({ id: clubsTable.id })
    .from(clubsTable)
    .where(eq(clubsTable.id, params.data.id));
  if (!club) {
    res.status(404).json({ error: "Club not found" });
    return;
  }

  await db.insert(clubInterestsTable).values({
    clubId: club.id,
    ...body.data,
  });

  res
    .status(201)
    .json(
      ExpressClubInterestResponse.parse({
        success: true,
        message: "Thanks — the club will be in touch with you soon.",
      }),
    );
});

router.get("/events", async (req, res): Promise<void> => {
  const query = ListEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { q, category, timeframe } = query.data;
  let events = await db.select().from(eventsTable).orderBy(asc(eventsTable.date));
  const normalizedQuery = q?.trim().toLowerCase();
  if (normalizedQuery) {
    events = events.filter((event) =>
      [event.title, event.category, event.description, event.location, ...(event.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }
  if (category) {
    events = events.filter((event) => event.category === category);
  }
  if (timeframe === "this-week") {
    const end = addDays(today(), 7);
    events = events.filter((event) => event.date >= today() && event.date <= end);
  }
  if (timeframe === "this-month") {
    events = events.filter((event) => event.date.startsWith(today().slice(0, 7)));
  }

  res.json(ListEventsResponse.parse(events.map(toEvent)));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(GetEventResponse.parse(toEvent(event)));
});

router.post("/events/:id/register", async (req, res): Promise<void> => {
  const params = RegisterForEventParams.safeParse({
    id: parseId(req.params.id),
  });
  const body = RegisterForEventBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  if (event.spotsLeft <= 0) {
    res.status(409).json({ error: "This event is currently full." });
    return;
  }

  await db.insert(eventRegistrationsTable).values({
    eventId: event.id,
    ...body.data,
  });
  await db
    .update(eventsTable)
    .set({ spotsLeft: event.spotsLeft - 1 })
    .where(and(eq(eventsTable.id, event.id), gt(eventsTable.spotsLeft, 0)));

  res
    .status(201)
    .json(
      RegisterForEventResponse.parse({
        success: true,
        message: "You're registered — we saved you a spot.",
      }),
    );
});

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.publishedAt));
  res.json(
    ListAnnouncementsResponse.parse(announcements.map(toAnnouncement)),
  );
});

const today = () => "2026-09-11";
const addDays = (date: string, days: number) => {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
};
export default router;