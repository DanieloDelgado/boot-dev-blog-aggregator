import { db } from "..";
import { and, eq } from 'drizzle-orm';
import { feedFollows, users, feeds } from "../schema";

export type CreatedFeedFollow = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    user: string;
    feed: string;
};

export async function createFeedFollow(userId: string, feedId: string): Promise<CreatedFeedFollow> {
    const [newFeedFollow] = await db.insert(feedFollows).values({ feedId, userId }).returning();
    const [result] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        user: users.name,
        feed: feeds.name
    }).from(feedFollows)
      .innerJoin(users, eq(feedFollows.userId, users.id))
      .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
      .where(eq(feedFollows.id, newFeedFollow.id));
    return result;
}

export async function getFeedFollowsForUser(userId: string): Promise<CreatedFeedFollow[]> {
    return await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        user: users.name,
        feed: feeds.name
    }).from(feedFollows)
      .innerJoin(users, eq(feedFollows.userId, users.id))
      .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
      .where(eq(feedFollows.userId, userId));
}

export async function deleteFeedFollow(userId: string, feedId: string): Promise<void> {
    await db.delete(feedFollows).where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}
