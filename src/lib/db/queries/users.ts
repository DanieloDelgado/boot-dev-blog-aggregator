import { db } from "..";
import { eq } from 'drizzle-orm';
import { users, SelectUser } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string): Promise<SelectUser> {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function deleteAllUsers()
{
    await db.delete(users);
}
