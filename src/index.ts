import { Client, Collection, IntentsBitField, Options } from 'discord.js';
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
    partials: [],
    intents: myIntents,

    sweepers: {
		...Options.DefaultSweeperSettings,
	},

    makeCache: Options.cacheWithLimits({
        GuildMemberManager: 10,
		AutoModerationRuleManager: 0,
        DMMessageManager: 0,
        GuildInviteManager: 0,
        GuildStickerManager: 0,
        GuildScheduledEventManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        VoiceStateManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 10,
        UserManager: 50,
        BaseGuildEmojiManager: 0,
        MessageManager: 50,
        GuildBanManager: 0,
        PresenceManager: 0,
        GuildEmojiManager: 0,
        ThreadMemberManager: 0,
        GuildTextThreadManager: 0,
        GuildForumThreadManager: 0,
	}),
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
