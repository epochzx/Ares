import { Client, Collection, IntentsBitField } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { SlashCommand } from './types';

import 'dotenv/config';

import { initMongoClient } from './services/dbService';
import { handleError } from './utils/errorHandler';

const myIntents = new IntentsBitField();

myIntents.add(
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildModeration,
);

export const client = new Client({
    intents: myIntents,
});

client.commands = new Collection<string, SlashCommand>();

async function start(): Promise<void> {
    const handlersDir = join(__dirname, './handlers');
    const eventsHandlerPath = join(handlersDir, 'eventHandler');
    const handlerFiles = readdirSync(handlersDir);

    // load events
    const eventsHandler = await import(eventsHandlerPath);
    await eventsHandler.default(client);

    // connect to mongodb and login
    await initMongoClient();
    await client.login(process.env.token);

    // load commands, modals and components
    for (const handler of handlerFiles) {
        if (handler === 'eventHandler.ts' || handler === 'eventHandler.js') {
            continue;
        }
    
        const handlerPath = join(handlersDir, handler);
        const handlerModule = await import(handlerPath);
    
        await handlerModule.default(client, client.commands);
    }
}

(async () => {
    try {
        await start();
    } catch (error) {
        console.error(`❌  Error logging in: ${error}`);
    }
})();

process.on('unhandledRejection', async error => {
    await handleError(error as Error);
    console.log(error);

    return;
});