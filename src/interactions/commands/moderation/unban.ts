import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { createAudit, handleUnban } from '../../../services/moderationService';
import { logModerationAction } from '../../../services/loggingService';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Member to unban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unban'))

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

        const reason = interaction.options.getString('reason') || 'No reason specified';

        const guild = interaction.guild;
        if (!guild) { return; }

        try {
            await guild.bans.remove(targetOption);
            reply(true, `Successfully unbanned <@${targetOption.id}>`, interaction);
        } catch (error) {
            await reply(false, `Failed to unban <@${targetOption.id}>: ${error}`, interaction);

            return;
        }

        const infractionId = Math.floor(new Date().getTime() / 1000);

        try {
            await handleUnban(targetOption.id);
        } catch (error) {
            await reply(false, `An error occurred when trying to update the databse: ${error}. <@${targetOption.id}> has still been successfully unbanned.`, interaction);
        }

        try {
            await createAudit(targetOption.id as string, interaction.member?.user.id as string, guild.id, `Unban`, reason, infractionId, `\`N/A\``);
            await logModerationAction(targetOption.id as string, interaction.member?.user.id as string, guild.id, `Unban`, reason, infractionId, `green`);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this unban: ${error}. <@${targetOption.id}> has still been successfully unbanned.`, interaction);
        }
    }   
};

export default command;