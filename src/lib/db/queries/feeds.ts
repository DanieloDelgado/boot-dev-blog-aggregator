import { db } from "..";
import { eq, sql  } from 'drizzle-orm';
import { feeds, SelectFeed } from "../schema";

export async function createFeed(name: string, url: string, userId: string): Promise<SelectFeed> {
    const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
    return result;
}

export async function getFeeds(): Promise<SelectFeed[]> {
    return db.select().from(feeds);
}

export async function getFeedByUrl(url: string): Promise<SelectFeed | undefined> {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function markFeedFetched(id: string): Promise<void> {
    await db.update(feeds).set({ lastFetchAt: new Date() }).where(eq(feeds.id, id));
}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchAt} asc nulls first`).limit(1);
    return result
}