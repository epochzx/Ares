import { Events, Message, TextChannel } from 'discord.js';
import { BotEvent, GuildLog } from '../../types';
import { client } from '../../index';
import { getOneDocument } from '../../services/dbService';
import { logEditedMessage } from '../../services/loggingService';
import { handleAutoMod } from '../../utils/automodHandler';
import { handleError } from '../../utils/errorHandler';

const event: BotEvent = {
    name: Events.MessageUpdate,
    once: false,
    guild: true,

    execute: async (oldMessage: Message, newMessage: Message) => {
        if (!newMessage.author) {
            return;
        }

        if (newMessage.author.bot) {
            return;
        } 

        try {
            if (await handleAutoMod(newMessage)) return;
        } catch (error) {
            await handleError(error as Error, `Error Handling messageCreate Event`);
            
            return;
        }

        const messageLogs = await getOneDocument<GuildLog>(`messageLogs`, { guildId: newMessage.guild?.id });
        if (!messageLogs) { return; }

        const logChannel = client.channels.cache.get(messageLogs.channel);
        await logEditedMessage(oldMessage, newMessage, logChannel as TextChannel);
    },
};

export default event;
