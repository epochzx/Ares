import { Client, Collection, IntentsBitField } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { SlashCommand } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getMongoClient } from './services/dbService';

import 'dotenv/config';
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

const handlersDir = join(__dirname, './handlers');
const eventsHandlerPath = join(handlersDir, 'eventHandler');

async function start() {
    // load events
    const eventsHandler = await import(eventsHandlerPath);
    await eventsHandler.default(client);

    // connect to mongodb and login
    //await getMongoClient();
    await client.login(process.env.token);

    // load commands, modals and components
    readdirSync(handlersDir).forEach(async (handler) => {
        if (handler == 'eventHandler.ts' || handler == 'eventHandler.js') { return; };

        const handlerPath = join(handlersDir, handler);
        const handlerModule = await import(handlerPath);
    
        handlerModule.default(client, client.commands);
    });
}

start();

process.on('unhandledRejection', async error => {
    await handleError(error as Error);
	console.log(error);

    return;
});
