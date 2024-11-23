import { Events, Message } from 'discord.js';
import { BotEvent } from '../../types';
import { handleAutoResponse } from '../../utils/replyHelper';
import { handleError } from '../../utils/errorHandler';
import { handleAutoMod } from '../../utils/automodHandler';

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    guild: true,

    execute: async (message: Message) => {
        if (message.author.bot) {
            return;
        }

        try {
            if (await handleAutoMod(message)) return;

            await handleAutoResponse(message);
        } catch (error) {
            await handleError(error as Error, `Error Handling messageCreate Event`);
        }
    },
};

export default event;
