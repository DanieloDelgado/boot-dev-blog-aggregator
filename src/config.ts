import os from 'os';
import fs, { write } from 'fs';
import path from 'path';

export type Config = {
    dbUrl: string,
    currentUserName?: string,
}

function getConfigFilePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.gatorconfig.json');
}

function writeConfig(config: Config){
    const configPath = getConfigFilePath();
    const data = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    }
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function validateConfig(rawConfig: any): Config {
    if (typeof rawConfig !== 'object' || rawConfig === null) {
        throw new Error('Invalid config format');
    }
    if (typeof rawConfig.db_url !== 'string') {
        throw new Error('Invalid config format');
    }
    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };
}

export function setUser(user: string) {
    const config = readConfig();
    config.currentUserName = user;
    writeConfig(config);
}

export function getUser(): string | undefined {
    const config = readConfig();
    return config.currentUserName;
}

export function readConfig(): Config {
    const configPath = getConfigFilePath();
    const config = fs.readFileSync(configPath, 'utf-8');
    const rawConfig = JSON.parse(config);
    return validateConfig(rawConfig);
}
