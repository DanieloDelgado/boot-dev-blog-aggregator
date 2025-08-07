import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export type SelectUser = InferSelectModel<typeof users>;

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    userId:  uuid("user_id").references(() => users.id, {onDelete: 'cascade'}).notNull(),
    lastFetchAt: timestamp("last_fetched_at")
});

export type SelectFeed = InferSelectModel<typeof feeds>;

export const feedFollows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    feedId: uuid("feed_id").references(() => feeds.id, {onDelete: 'cascade'}).notNull(),
    userId: uuid("user_id").references(() => users.id, {onDelete: 'cascade'}).notNull(),   
}, (t) => [
    unique().on(t.feedId, t.userId)
]);

export type SelectFeedFollow = InferSelectModel<typeof feedFollows>;

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    title: text("title"),
    url: text("url").notNull().unique(),
    description: text("description"),
    publishedAt: timestamp("published_at").notNull(),
    feedId: uuid("feed_id").references(() => feeds.id, {onDelete: 'cascade'}).notNull(),
});

export type InsertPosts = InferInsertModel<typeof posts>
