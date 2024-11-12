import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { createAudit } from '../../../services/moderationService';
import { logModerationAction } from '../../../services/loggingService';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Member to unmute')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unmute'))

        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
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
        
        if (!target) {
            await reply(false, `This user is not in the server.`, interaction);

            return;
        }

        if (target?.communicationDisabledUntil == null) {
            await reply(false, `<@${target.id}> is not muted.`, interaction);

            return;
        }

        const reason = interaction.options.getString('reason') || 'No reason specified';

        try {
            await target.timeout(null);
            await reply(true, `Successfully unmuted <@${target.id}>`, interaction);
        } catch (error) {
            await reply(false, `Failed to unmute <@${target.id}>: ${error}`, interaction);

            return;
        }

        const guild = interaction.guild;
        if (!guild) { return; }

        const infractionId = Math.floor(new Date().getTime() / 1000);
        const evidence = '`None`';

        try {
            await createAudit(target?.id as string, interaction.member?.user.id as string, guild.id, `Unmute`, reason, infractionId, evidence);
            await logModerationAction(target?.id as string, interaction.member?.user.id as string, guild.id, `Unmute`, reason, infractionId, `green`);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this unmute: ${error}. <@${target?.id}> has still been successfully unmuted.`, interaction);
        }
    }   
};

export default command;