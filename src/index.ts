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

    try {
        await cmd.runCommand(cmdRegistry, args[0], args[1]);
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
