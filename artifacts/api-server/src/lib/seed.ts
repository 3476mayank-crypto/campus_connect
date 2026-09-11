import { asc, eq } from "drizzle-orm";
import {
  announcementsTable,
  clubsTable,
  db,
  eventsTable,
} from "@workspace/db";
import { logger } from "./logger";

const clubs = [
  {
    name: "Northstar Debate Society",
    shortName: "NDS",
    category: "Academic",
    description:
      "A welcoming home for students who want to sharpen their voice, think on their feet, and make a persuasive case.",
    purpose:
      "Build confidence through British Parliamentary debate, public speaking, and friendly inter-college tournaments.",
    meetingSchedule: "Tuesdays · 5:30 PM · Seminar Hall 2",
    eligibility: "Open to all students. No prior debate experience needed.",
    membershipProcess: "Attend one open practice, then complete the short member form.",
    memberCount: 86,
    accent: "coral",
    featured: true,
    tags: ["debate", "public speaking", "competitions"],
  },
  {
    name: "The Green Collective",
    shortName: "TGC",
    category: "Community",
    description:
      "Students making campus more sustainable through small projects with visible, lasting impact.",
    purpose:
      "Turn environmental ideas into action through campus gardens, repair events, and awareness campaigns.",
    meetingSchedule: "Thursdays · 4:00 PM · Student Commons",
    eligibility: "Open to every student who cares about a greener campus.",
    membershipProcess: "Drop into a Thursday circle or send the club a note.",
    memberCount: 142,
    accent: "mint",
    featured: true,
    tags: ["sustainability", "volunteering", "community"],
  },
  {
    name: "Pixel & Product Lab",
    shortName: "PPL",
    category: "Technology",
    description:
      "A hands-on studio for designers, developers, and curious builders turning messy ideas into useful things.",
    purpose:
      "Learn product thinking by building in small, supportive teams and sharing work-in-progress.",
    meetingSchedule: "Wednesdays · 6:00 PM · Innovation Studio",
    eligibility: "Open to all years and disciplines. Bring curiosity, not a portfolio.",
    membershipProcess: "Join a welcome workshop and pick a project crew.",
    memberCount: 118,
    accent: "violet",
    featured: true,
    tags: ["design", "coding", "startups"],
  },
  {
    name: "Raag Rhythm Collective",
    shortName: "RRC",
    category: "Arts",
    description:
      "A cross-campus music community for people who play, sing, listen closely, and love making something together.",
    purpose:
      "Explore Indian and global musical traditions through jam sessions, showcases, and collaborations.",
    meetingSchedule: "Fridays · 5:00 PM · Arts Block Studio",
    eligibility: "All skill levels welcome; auditions are only for showcase teams.",
    membershipProcess: "Come to a jam session and introduce yourself.",
    memberCount: 74,
    accent: "amber",
    featured: false,
    tags: ["music", "performance", "culture"],
  },
  {
    name: "Campus Creators Network",
    shortName: "CCN",
    category: "Media",
    description:
      "The student newsroom and creative studio covering the people, ideas, and moments that shape campus.",
    purpose:
      "Give students a place to write, photograph, film, and publish stories worth remembering.",
    meetingSchedule: "Mondays · 6:30 PM · Media Lab",
    eligibility: "Open to students interested in storytelling in any format.",
    membershipProcess: "Submit one story idea or join an editorial orientation.",
    memberCount: 63,
    accent: "blue",
    featured: false,
    tags: ["writing", "photography", "film"],
  },
  {
    name: "Mindful Campus",
    shortName: "MC",
    category: "Wellbeing",
    description:
      "A low-pressure community for slowing down, checking in, and building healthier student rhythms together.",
    purpose:
      "Make simple wellbeing practices more accessible through peer circles, walks, and guided sessions.",
    meetingSchedule: "Sundays · 8:00 AM · East Lawn",
    eligibility: "Open to every student, especially beginners.",
    membershipProcess: "Register for any session to become part of the circle.",
    memberCount: 205,
    accent: "sky",
    featured: false,
    tags: ["wellbeing", "mindfulness", "peer support"],
  },
];

const events = [
  {
    title: "Open Mic Under the Stars",
    category: "Arts & Culture",
    description:
      "An easygoing evening of music, poetry, comedy, and stories from across campus.",
    date: "2026-09-15",
    time: "6:30 PM – 8:30 PM",
    location: "Amphitheatre Lawn",
    organizer: "Raag Rhythm Collective",
    capacity: 250,
    spotsLeft: 84,
    accent: "amber",
    featured: true,
    tags: ["music", "performance", "free"],
  },
  {
    title: "Build for Good: Civic Tech Sprint",
    category: "Technology",
    description:
      "A one-day team challenge to prototype simple digital tools for real campus and community needs.",
    date: "2026-09-18",
    time: "9:00 AM – 7:00 PM",
    location: "Innovation Studio",
    organizer: "Pixel & Product Lab",
    capacity: 80,
    spotsLeft: 19,
    accent: "violet",
    featured: true,
    tags: ["hackathon", "teams", "projects"],
  },
  {
    title: "Inter-college Debate Invitational",
    category: "Competitions",
    description:
      "Watch the region's strongest student speakers take on a full day of fast-paced rounds.",
    date: "2026-09-20",
    time: "10:00 AM – 5:00 PM",
    location: "Main Auditorium",
    organizer: "Northstar Debate Society",
    capacity: 320,
    spotsLeft: 156,
    accent: "coral",
    featured: false,
    tags: ["debate", "competition", "speaking"],
  },
  {
    title: "Repair Café: Fix, Learn, Repeat",
    category: "Community",
    description:
      "Bring a small household item, learn how to repair it, and keep useful things in use for longer.",
    date: "2026-09-23",
    time: "3:00 PM – 6:00 PM",
    location: "Student Commons",
    organizer: "The Green Collective",
    capacity: 60,
    spotsLeft: 28,
    accent: "mint",
    featured: false,
    tags: ["sustainability", "workshop", "hands-on"],
  },
  {
    title: "Freshers' Creator Walk",
    category: "Social",
    description:
      "A low-stakes photo walk around campus with prompts, new faces, and no experience required.",
    date: "2026-09-26",
    time: "4:00 PM – 6:00 PM",
    location: "Meet at North Gate",
    organizer: "Campus Creators Network",
    capacity: 45,
    spotsLeft: 11,
    accent: "blue",
    featured: false,
    tags: ["photography", "freshers", "social"],
  },
  {
    title: "Sunday Reset on the East Lawn",
    category: "Wellbeing",
    description:
      "A gentle morning of guided breathing, journaling, and a quiet walk before the week begins.",
    date: "2026-09-27",
    time: "8:00 AM – 9:15 AM",
    location: "East Lawn",
    organizer: "Mindful Campus",
    capacity: 75,
    spotsLeft: 42,
    accent: "sky",
    featured: false,
    tags: ["mindfulness", "morning", "wellbeing"],
  },
];

const announcements = [
  {
    title: "Club registrations are open for the semester",
    body: "Browse the directory, find your people, and send a quick note to any club that catches your eye.",
    publishedAt: new Date("2026-09-10T09:00:00.000Z"),
    kind: "Campus life",
    urgent: false,
  },
  {
    title: "Student activity grant applications close Friday",
    body: "Clubs can apply for up to ₹25,000 in support for events, equipment, and community projects.",
    publishedAt: new Date("2026-09-09T11:30:00.000Z"),
    kind: "Funding",
    urgent: true,
  },
  {
    title: "Welcome Week venues have moved indoors",
    body: "Due to the weather forecast, Wednesday's activity fair will be held in the Student Commons from 2 PM.",
    publishedAt: new Date("2026-09-08T14:00:00.000Z"),
    kind: "Notice",
    urgent: false,
  },
];

export async function seedCampusData(): Promise<void> {
  const existingClubs = await db
    .select({ id: clubsTable.id })
    .from(clubsTable)
    .orderBy(asc(clubsTable.id))
    .limit(1);

  if (existingClubs.length > 0) {
    return;
  }

  await db.insert(clubsTable).values(clubs);
  await db.insert(eventsTable).values(events);
  await db.insert(announcementsTable).values(announcements);
  logger.info("Seeded Campus Connect sample content");
}