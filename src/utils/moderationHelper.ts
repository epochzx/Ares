import { GuildMember, PermissionsBitField, ChatInputCommandInteraction } from 'discord.js';
import { reply } from './replyHelper';
import data from '../data.json';
import { formatTimeUntil } from './miscHelper';
import { Infraction } from '../types';

export async function verifyTarget(target: GuildMember | null, interaction: ChatInputCommandInteraction): Promise<boolean | null> {
    if (!target) {
        await reply(false, `This user is not in the server.`, interaction);
        return false;
    }

    if (target.id === interaction.member?.user.id) {
        await reply(false, `You cannot moderate yourself.`, interaction);
        return false;
    }

    if (!interaction.guild) { return null; }
    if (!interaction.guild.members.me) { return null; }

    if (target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        await reply(false, `<@${target.id}> has a higher or equal role to me.`, interaction);
        return false;
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        if (
            target.permissions.has([
                PermissionsBitField.Flags.KickMembers,
                PermissionsBitField.Flags.BanMembers,
            ])
        ) {
            await reply(false, `You cannot moderate another moderator.`, interaction);
            return false;
        }

        const issuer = interaction.member as GuildMember;
        if (target.roles.highest.position >= issuer.roles.highest.position) {
            await reply(false, `You cannot moderate somebody of an equal or higher role.`, interaction);
            return false;
        }
    }

    return true;
}

export async function getDuration(duration: string): Promise<number | boolean> {
    const match = duration.match(/(\d+)([a-zA-Z]+)/);

    if (!match) {
        return false;
    }

    const time = parseInt(match[1]);
    const unit = match[2] as 's' | 'h' | 'd' | 'm' | 'y';

    if (isNaN(time)) {
        return false;
    }

    const validUnits = new Set(['s', 'm', 'h', 'd', 'y']);
    if (!validUnits.has(unit)) {
        return false;
    }

    const unitToMilliseconds = {
        's': 1000,
        'h': 1000 * 60 * 60,
        'd': 1000 * 60 * 60 * 24,
        'm': 1000 * 60 * 60 * 24 * 30,
        'y': 1000 * 60 * 60 * 24 * 365,
    };

    return time * unitToMilliseconds[unit];
}

export async function infractionToString(infraction: Infraction): Promise<string> {
    let baseInfo = `${data.emojis.id} **Infraction ID:** \`${infraction.time}\` \n` +
                `${data.emojis.user} **Suspect:** <@${infraction.userId}> (\`${infraction.userId}\`)\n` +
                `${data.emojis.adminUser} **Moderator:** <@${infraction.moderator}> (\`${infraction.moderator}\`) \n` +
                `${data.emojis.id} **Action:** \`${infraction.action}\` \n` +
                `${data.emojis.reason} **Reason:** \`${infraction.reason}\` \n` +
                `${data.emojis.picture} **Evidence:** ${infraction.evidence} \n` +
                `${data.emojis.time} **Issued:** <t:${infraction.time}:f> \n`;

    if (infraction.ends) {
        const isPermanent = infraction.ends === '`PERM`';
        const endsText = isPermanent ? '`PERM`' : `<t:${Math.floor(infraction.ends as number / 1000)}:f>`;
        const durationText = isPermanent ? '`PERM`' : formatTimeUntil(infraction.ends as number, Math.floor(infraction.time * 1000));

        baseInfo += `${data.emojis.timer} **Ends:** ${endsText} \n` +
                    `${data.emojis.duration} **Duration:** \`${durationText}\` \n`;
    }

    if (infraction.active) {
        baseInfo += `${data.emojis.failureFilled} **Active** \n`;
    }

    return baseInfo;
}