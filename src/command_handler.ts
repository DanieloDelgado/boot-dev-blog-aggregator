import { cosineDistance } from 'drizzle-orm';
import { setUser, getUser } from './config';
import * as userQueries from './lib/db/queries/users';
import * as feedQueries from './lib/db/queries/feeds';
import { fetchFeed } from './rss';

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length == 0 || args[0] === undefined){
        throw new Error("Username is required");
    }

    const user = await userQueries.getUserByName(args[0]);
    if (user === undefined) {
        throw new Error(`User ${args[0]} does not exist`);
    }

    setUser(args[0]);
    console.log(`User set to ${args[0]}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length == 0 || args[0] === undefined){
        throw new Error("Username is required");
    }
    const existingUser = await userQueries.getUserByName(args[0]);
    if (existingUser) {
        throw new Error(`User ${args[0]} already exists`);
    }

    const response = await userQueries.createUser(args[0]);
    setUser(args[0]);
    console.log(`User ${args[0]} created successfully`);
    console.log(response);
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await userQueries.deleteAllUsers();
    console.log("All users deleted successfully");
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const currentUser = getUser();
    const users = await userQueries.getAllUsers();
    for (const user of users) {
            console.log(`* ${user}${user === currentUser ? " (current)": ""}`);
    }
}

export async function handlerAggregate(cmdName: string, ...args: string[]) {
    const feed = await fetchFeed('https://www.wagslane.dev/index.xml');
    console.log(JSON.stringify(feed, null, 2));
}

export async function handlderAddFeed(cmdName: string, ...args: string[]) {
    console.log(`Adding feed with args: ${args.length} - ${args[0]} - ${args[1]}`);
    if (args.length < 2 || args[0] === undefined || args[1] === undefined){
        throw new Error("Feed name and URL are required");
    }
    const name = args[0];
    const url = args[1];
    const currentUser = getUser();
    if (!currentUser) {
        throw new Error("No user logged in");
    }
    const user = await userQueries.getUserByName(currentUser);
    if (!user) {
        throw new Error(`User ${currentUser} does not exist`);
    }
    await feedQueries.createFeed(name, url, user.id);
    console.log(`Feed ${name} added successfully for user ${currentUser}`);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;    
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}

export type CommandsRegistry = {
    [key: string]: CommandHandler;
}
