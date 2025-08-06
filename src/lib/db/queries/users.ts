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

export async function getUserById(id: string): Promise<SelectUser> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
}

export async function getAllUsers(): Promise<string[]> {
  const results = await db.select({ name: users.name }).from(users);
  return results.map(user => user.name);
}

export async function deleteAllUsers()
{
    await db.delete(users);
}
