import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const clubsTable = pgTable("campus_clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  purpose: text("purpose").notNull(),
  meetingSchedule: text("meeting_schedule").notNull(),
  eligibility: text("eligibility").notNull(),
  membershipProcess: text("membership_process").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  accent: text("accent").notNull(),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
});

export const eventsTable = pgTable("campus_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  organizer: text("organizer").notNull(),
  capacity: integer("capacity").notNull(),
  spotsLeft: integer("spots_left").notNull(),
  accent: text("accent").notNull(),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
});

export const announcementsTable = pgTable("campus_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  kind: text("kind").notNull(),
  urgent: boolean("urgent").notNull().default(false),
});

export const clubInterestsTable = pgTable("club_interests", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id")
    .notNull()
    .references(() => clubsTable.id),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventRegistrationsTable = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubsTable).omit({
  id: true,
});
export const insertEventSchema = createInsertSchema(eventsTable).omit({
  id: true,
});
export const insertAnnouncementSchema = createInsertSchema(
  announcementsTable,
).omit({ id: true });
export const insertClubInterestSchema = createInsertSchema(
  clubInterestsTable,
).omit({ id: true, createdAt: true });
export const insertEventRegistrationSchema = createInsertSchema(
  eventRegistrationsTable,
).omit({ id: true, createdAt: true });

export type Club = typeof clubsTable.$inferSelect;
export type Event = typeof eventsTable.$inferSelect;
export type Announcement = typeof announcementsTable.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;