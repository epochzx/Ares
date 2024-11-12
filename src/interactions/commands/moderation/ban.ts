import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildMember, ColorResolvable, UserResolvable } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { getDuration, verifyTarget } from '../../../utils/moderationHelper';
import data from '../../../data.json';
import { logModerationAction } from '../../../services/loggingService';
import { createInfraction } from '../../../services/moderationService';
import { formatTimeUntil } from '../../../utils/miscHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Member to ban')
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('silent')
                .setDescription(`Delete this users message history over 7 days`)
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration of ban'))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for ban'))
        .addStringOption(option => 
            option.setName('evidence')
                .setDescription('Evidence for reason of ban'))

        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts([0]),

    execute: async (interaction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const targetOption = interaction.options.getUser('target');
        if (!targetOption) { return; }

        const target = interaction.guild?.members.cache.get(targetOption.id);
        
        const validTarget = await verifyTarget(target as GuildMember, interaction);
        if (!validTarget) { return; }

        const duration = interaction.options.getString('duration');
        let validDuration: number | boolean | string;

        if (duration == null) {
            validDuration = `PERM`;
        } else {
            validDuration = await getDuration(duration as string);

            if (!validDuration) {
                await reply(false, `A proper duration was not given. \nAcceptable parameters: \`(s)econds\`, \`(h)ours\`, \`(d)ays\`, \`(m)onths\`, \`(y)ears\` \nExample usage: \`60s\`, \`3d\`, etc.`, interaction);
            
                return;
            }
        }

        const reason = interaction.options.getString('reason') || 'No reason specified';
        let evidence = interaction.options.getString('evidence');

        if (!evidence) {
            evidence = '`None`';
        } else if (!evidence.includes('https://')) {
            await reply(false, `Evidence must be a media URL.`, interaction);

            return;
        }
        
        const infractionId = Math.floor(new Date().getTime() / 1000);

        const guild = interaction.guild;
        if (!guild) { return; }

        const deleteMessages = interaction.options.getBoolean('deleteMessages');
        let deleteMessagesSeconds;

        if (!deleteMessages) {
            deleteMessagesSeconds = 604800;
        } else {
            deleteMessagesSeconds = 0;
        }

        let unbanTimeMilliseconds;
        let unbanTimeUnixTimecode;
        let unbanTimeHumanFormat;

        if (validDuration == `PERM`) {
            unbanTimeMilliseconds = `\`PERM\``;
            unbanTimeUnixTimecode = `\`NEVER\``;
            unbanTimeHumanFormat = `\`PERM\``;
        } else {
            unbanTimeMilliseconds = Date.now() + (validDuration as number);
            unbanTimeUnixTimecode = `<t:${Math.floor(unbanTimeMilliseconds / 1000)}:f>`;
            unbanTimeHumanFormat = formatTimeUntil(unbanTimeMilliseconds, Date.now());
        }

        if (target) {
            const userEmbed = new EmbedBuilder()
                .setTitle(`You were banned from ${interaction.guild?.name}`)
                .setColor(data.colours.error as ColorResolvable)
                .setDescription(`
                    ${data.emojis.message} **Reason:** \`${reason}\` \n` +
                    `${data.emojis.adminUser} **Moderator:** <@${interaction.member?.user.id}> (\`${interaction.member?.user.id}\`) \n` +
                    `${data.emojis.time} **Duration:** \`${unbanTimeHumanFormat}\` \n` +
                    `${data.emojis.timer} **Ends:** ${unbanTimeUnixTimecode} \n` +
                    `${data.emojis.picture} **Evidence:** ${evidence}`)
                .setAuthor({
                    iconURL: interaction.guild.iconURL() as string, 
                    name: interaction.guild.name
                });

            try {
                await target.send({embeds: [userEmbed]});
            } catch {
                console.log(`Could not DM ban message to ${target.id}`);
            }
        }

        try {
            await guild.bans.create(target as UserResolvable, { 
                deleteMessageSeconds: deleteMessagesSeconds,
                reason: reason, 
            });

            await reply(true, `Successfully banned <@${target?.id}> for \`${unbanTimeHumanFormat}\``, interaction);
        } catch (error) {
            reply(false, `Failed to ban <@${target?.id}>: ${error}`, interaction);

            return;
        }

        try {
            await createInfraction(target?.id as string, interaction.member?.user.id as string, guild.id, `Ban`, reason, infractionId, evidence, unbanTimeMilliseconds, true);
            await logModerationAction(target?.id as string, interaction.member?.user.id as string, guild.id, `Ban`, reason, infractionId, `red`, evidence, unbanTimeHumanFormat);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this ban: ${error}. <@${target?.id}> has still been successfully banned.`, interaction);
        }
    }   
};

export default command;