import { Events, Message, TextChannel } from 'discord.js';
import { BotEvent } from '../../types';
import { client } from '../../index';
import { getOneDocument } from '../../services/dbService';
import { logDeletedMessage } from '../../services/loggingService';

const event: BotEvent = {
    name: Events.MessageDelete,
    once: false,

    execute: async (message: Message) => {
        if (!message.author) {
            return;
        }

        if (message.author.bot) {
            return;
        } 

        const messageLogs = await getOneDocument(`messageLogs`, { guildId: message.guild?.id });
        if (!messageLogs) { return; }
        
        const logChannel = client.channels.cache.get(messageLogs.channel);
        await logDeletedMessage(message, logChannel as TextChannel);
    },
};

export default event;