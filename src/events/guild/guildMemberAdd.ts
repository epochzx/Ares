import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../../types';
import { client } from '../../index';
import { getOneDocument } from '../../services/dbService';
import { logMemberJoinOrLeave } from '../../services/loggingService';

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    once: false,

    execute: async (member: GuildMember) => {
        const guild = member.guild;

        const memberLogs = await getOneDocument(`memberLogs`, { guildId: guild.id });
        if (!memberLogs) { return; }

        const logChannel = client.channels.cache.get(memberLogs.channel);
        await logMemberJoinOrLeave(member, true, logChannel as TextChannel);
    },
};

export default event;
