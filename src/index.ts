import {setUser, readConfig} from './config';

function main() {
    setUser("Daniel");
    const config = readConfig();
    console.log(config);
}

main();
