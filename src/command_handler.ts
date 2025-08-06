import { setUser } from './config';
import * as userQueries from './lib/db/queries/users';

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
