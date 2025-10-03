import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  rememberMe: boolean("remember_me").default(false),
  language: text("language").default("en"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"),
  content: text("content").notNull(),
  encrypted: text("encrypted"),
  type: text("type").notNull(),
  severity: text("severity"),
  region: text("region"),
  timestamp: timestamp("timestamp").defaultNow(),
  isPinned: boolean("is_pinned").default(false),
});

export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: jsonb("location").notNull(),
  creatorId: varchar("creator_id").notNull(),
  memberCount: integer("member_count").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const mapMarkers = pgTable("map_markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  location: jsonb("location").notNull(),
  data: jsonb("data"),
  createdBy: varchar("created_by").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  timestamp: true,
  memberCount: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  timestamp: true,
});

export const insertMapMarkerSchema = createInsertSchema(mapMarkers).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertMapMarker = z.infer<typeof insertMapMarkerSchema>;
export type MapMarker = typeof mapMarkers.$inferSelect;
