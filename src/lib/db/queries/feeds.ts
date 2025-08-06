import { db } from "..";
import { feeds, SelectFeed } from "../schema";

export async function createFeed(name: string, url: string, userId: string): Promise<void> {
    await db.insert(feeds).values({ name, url, userId });
}

export async function getFeeds(): Promise<SelectFeed[]> {
    return db.select().from(feeds);
}
