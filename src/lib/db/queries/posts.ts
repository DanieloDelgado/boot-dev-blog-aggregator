import { db } from "..";
import { eq, desc  } from 'drizzle-orm';
import { posts, feedFollows } from "../schema";
import type { InsertPosts } from "../schema";

export async function createPost(post: InsertPosts) {
  const [result] = await db.insert(posts).values(post).returning();
  return result;
}

export async function getPostByUrl(url: string) {
    const [result] = await db.select().from(posts).where(eq(posts.url, url));
    return result;
}

export async function getPostByUserID(userId: string, limit: number) {
    const sq = db.select().from(feedFollows).where(eq(feedFollows.userId, userId)).as('sq');
    const result = await db.select().from(posts).innerJoin(sq, eq(posts.feedId, sq.feedId)).orderBy(desc(posts.publishedAt)).limit(limit);
    return result.map(item => item.posts);
}