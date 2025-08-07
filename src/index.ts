import * as cmd from './command_handler';

async function main() {
    const cmdRegistry: cmd.CommandsRegistry = {};
    const args = process.argv.slice(2);
    if (args.length === 0){
        console.error("No command provided");
        process.exit(1);
    }
    cmd.registerCommand(cmdRegistry, 'login', cmd.handlerLogin);
    cmd.registerCommand(cmdRegistry, 'register', cmd.handlerRegister);
    cmd.registerCommand(cmdRegistry, 'reset', cmd.handlerReset);
    cmd.registerCommand(cmdRegistry, 'users', cmd.handlerUsers);
    cmd.registerCommand(cmdRegistry, 'agg', cmd.handlerAggregate);
    cmd.registerCommand(cmdRegistry, 'addfeed', cmd.requireLogin(cmd.handlderAddFeed));
    cmd.registerCommand(cmdRegistry, 'feeds', cmd.handlerFeeds);
    cmd.registerCommand(cmdRegistry, 'follow', cmd.requireLogin(cmd.handlerFollow));
    cmd.registerCommand(cmdRegistry, 'following', cmd.requireLogin(cmd.handlerFollowing));
    cmd.registerCommand(cmdRegistry, 'unfollow', cmd.requireLogin(cmd.handlerUnfollow));
    cmd.registerCommand(cmdRegistry, 'browse', cmd.requireLogin(cmd.handlerBrowse));
    
    try {
        await cmd.runCommand(cmdRegistry, args[0], ...args.slice(1));
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(`Unknown error: ${error}`);
        }
        process.exit(1);
    }
    process.exit(0);
}

main();
