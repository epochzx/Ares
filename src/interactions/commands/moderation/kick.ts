import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildMember, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { verifyTarget } from '../../../utils/moderationHelper';
import data from '../../../data.json';
import { createInfraction } from '../../../services/moderationService';
import { logModerationAction } from '../../../services/loggingService';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Member to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kick'))
        .addStringOption(option => 
            option.setName('evidence')
                .setDescription('Evidence for reason of kick'))

        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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

        if (target) {
            const userEmbed = new EmbedBuilder()
                .setTitle(`You were kicked from ${interaction.guild?.name}`)
                .setColor(data.colours.error as ColorResolvable)
                .setDescription(`
                    ${data.emojis.message} **Reason:** \`${reason}\` \n` +
                    `${data.emojis.adminUser} **Moderator:** <@${interaction.member?.user.id}> (\`${interaction.member?.user.id}\`) \n` +
                    `${data.emojis.picture} **Evidence:** ${evidence}`)
                .setAuthor({
                    iconURL: interaction.guild.iconURL() as string, 
                    name: interaction.guild.name
                });

            try {
                await target.send({embeds: [userEmbed]});
            } catch {
                console.log(`Could not DM kick message to ${target.id}`);
            }
        }

         try {
            await target?.kick(reason);
            await reply(true, `Successfully kicked <@${target?.id}>`, interaction);
        } catch (error) {
            await reply(false, `Failed to kick <@${target?.id}>: ${error}`, interaction);

            return;
        }

        try {
            await createInfraction(target?.id as string, interaction.member?.user.id as string, guild.id, `Kick`, reason, infractionId, evidence);
            await logModerationAction(target?.id as string, interaction.member?.user.id as string, guild.id, `Kick`, reason, infractionId, `red`, evidence);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this kick: ${error}. <@${target?.id}> has still been successfully kicked.`, interaction);
        }
    }
};

export default command;