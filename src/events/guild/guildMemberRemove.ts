import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent, GuildLog } from '../../types';
import { client } from '../../index';
import { getOneDocument } from '../../services/dbService';
import { logMemberJoinOrLeave } from '../../services/loggingService';

const event: BotEvent = {
    name: Events.GuildMemberRemove,
    once: false,
    guild: true,

    execute: async (member: GuildMember) => {
        const guild = member.guild;

        const memberLogs = await getOneDocument<GuildLog>(`memberLogs`, { guildId: guild.id });
        if (!memberLogs) { return; }

        const logChannel = client.channels.cache.get(memberLogs.channel);
        await logMemberJoinOrLeave(member, false, logChannel as TextChannel);
    },
};

export default event;
