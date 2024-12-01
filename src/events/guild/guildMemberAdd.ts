import { Events, GuildMember } from 'discord.js';
import { BotEvent } from '../../types';
import { logMemberJoinOrLeave } from '../../services/loggingService';

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    once: false,
    guild: true,

    execute: async (member: GuildMember) => {
        const guild = member.guild;

        await logMemberJoinOrLeave(member, true, guild.id);
    },
};

export default event;
