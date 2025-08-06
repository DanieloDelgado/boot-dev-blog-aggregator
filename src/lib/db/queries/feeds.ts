import { db } from "..";
import { eq } from 'drizzle-orm';
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
