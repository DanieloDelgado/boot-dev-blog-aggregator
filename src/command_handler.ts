import { setUser, getUser } from './config';
import * as userQueries from './lib/db/queries/users';
import * as feedQueries from './lib/db/queries/feeds';
import * as feedFollowQueries from './lib/db/queries/feed_follows';
import * as postQueries from './lib/db/queries/posts';
import { scrapeFeeds } from './rss';
import type { SelectUser } from './lib/db/schema';


type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type UserCommandHandler = (
  cmdName: string,
  user: SelectUser,
  ...args: string[]
) => Promise<void>;


function parseDuration(durationStr: string){
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error("Invalid time")
    }
    let duration = Number(match[1])
    switch (match[2]){
        case "s":
            duration *= 1000;
            break;
        case "m":
            duration *= 60000;
            break;
        case "h":
            duration *= 3600000;
    }
    return duration;
}

export function requireLogin(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const currentUser = getUser();
        if (!currentUser) {
            throw new Error("No user logged in");
        }

        const user = await userQueries.getUserByName(currentUser);
        if (!user) {
            throw new Error(`User ${currentUser} does not exist`);
        }
        await handler(cmdName, user, ...args);
    };
}

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
    if (args.length < 1 || args[0] === undefined){
        throw new Error("Time betwee requests is required");
    }
    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${timeBetweenRequests / 1000}s`);

    const interval = setInterval(() => {
    scrapeFeeds();
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });

}

export async function handlderAddFeed(cmdName: string, user: SelectUser, ...args: string[]) {
    if (args.length < 2 || args[0] === undefined || args[1] === undefined){
        throw new Error("Feed name and URL are required");
    }
    const name = args[0];
    const url = args[1];
    const feed = await feedQueries.createFeed(name, url, user.id);
    console.log(`Feed ${name} added successfully for user ${user.name}`);

    await feedFollowQueries.createFeedFollow(user.id, feed.id);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
    const feeds = await feedQueries.getFeeds();
    for (const feed of feeds) {
        const user = await userQueries.getUserById(feed.userId);
        console.log(`* ${feed.name} (${feed.url}) - User: ${user.name}`);
    }
}

export async function handlerFollow(cmdName: string, user: SelectUser,...args: string[]) {
    if (args.length == 0 || args[0] === undefined){
        throw new Error("Url is required");
    }
    const feed = await feedQueries.getFeedByUrl(args[0]);
    if (!feed) {
        throw new Error(`Feed ${args[0]} does not exist`);
    }

    await feedFollowQueries.createFeedFollow(user.id, feed.id);
    console.log(`Feed "${feed.name}" followed successfully by user ${user.name}`);
}

export async function handlerFollowing(cmdName: string, user: SelectUser, ...args: string[]) {
    const follows = await feedFollowQueries.getFeedFollowsForUser(user.id);
    if (follows.length === 0) {
        console.log(`${user.name} is not following any feeds.`);
        return;
    }

    console.log(`${user.name} is following the following feeds:`);
    for (const follow of follows) {
        console.log(`- ${follow.feed}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: SelectUser,...args: string[]) {
    if (args.length == 0 || args[0] === undefined){
        throw new Error("Url is required");
    }
    const feed = await feedQueries.getFeedByUrl(args[0]);
    if (!feed) {
        throw new Error(`Feed ${args[0]} does not exist`);
    }

    await feedFollowQueries.deleteFeedFollow(user.id, feed.id);
}

export async function handlerBrowse(cmdName: string, user: SelectUser,...args: string[]) {
    let numberOfPosts = 2;
    if (args.length == 1 || args[0] !== undefined){
        numberOfPosts = Number(args[0])
    }
    const posts = await postQueries.getPostByUserID(user.id, numberOfPosts);
    for (const post of posts){
        console.log(post)
    }
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
