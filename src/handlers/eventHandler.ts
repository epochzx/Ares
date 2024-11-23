import { Client } from 'discord.js';
import { join } from 'path';
import { BotEvent } from '../types';

import getFiles from '../utils/fileHelper';
import { pluralize } from '../utils/replyHelper';
import settings from '../settings.json';

export default async function loadEvents(client: Client): Promise<void> {
    const eventsDir = join(__dirname, '../events');
    const eventFiles = getFiles(eventsDir);

    let loadedCount = 0;

    if (!settings.loadGuildEvents) {
        console.log(`✖️   Guild event loading has been disabled`);
    }

    for (const filePath of eventFiles) {
        try {
            const eventModule = await import(filePath);
            const event: BotEvent = eventModule.default;

            if (!settings.loadGuildEvents) {
                if (event.guild) {
                    continue;
                }
            }

            loadedCount++;

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            } 
        } catch (error) {
            console.log(`❌  Failed to load event from ${filePath}: ${error}`);
        }
    }

    if (loadedCount == 0) {
        console.log(`❌  0 events to load`);
    } else {
        console.log(`✅  Successfully loaded ${pluralize(loadedCount, `event`)}`);
    }
}