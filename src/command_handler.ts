import { setUser } from './config';

type CommandHandler = (cmdName: string, ...args: string[]) => void;


export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length == 0 || args[0] === undefined){
        throw new Error("Username is required");
    }
    setUser(args[0]);
    console.log(`User set to ${args[0]}`);
}


export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;    
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    handler(cmdName, ...args);
}

export type CommandsRegistry = {
    [key: string]: CommandHandler;
}
