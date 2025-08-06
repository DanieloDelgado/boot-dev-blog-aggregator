import { db } from "..";
import { feeds } from "../schema";

export async function createFeed(name: string, url: string, userId: string): Promise<void> {
    await db.insert(feeds).values({ name, url, userId });
}
