import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import data from '../../../data.json';
import { getOneDocument } from '../../../services/dbService';
import { getPrimaryColour } from '../../../utils/replyHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure guild related settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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

        const guild = interaction.guild;
        if (!guild) { return; }

        const moderationLogs = await getOneDocument(`modLogs`, { guildId: guild.id });
        const messageLogs = await getOneDocument(`messageLogs`, { guildId: guild.id });
        const memberLogs = await getOneDocument(`memberLogs`, { guildId: guild.id });

        async function getButtonStyle(log: { enabled: boolean } | null): Promise<ButtonStyle> {
            if (!log) return ButtonStyle.Secondary;
            return log.enabled ? ButtonStyle.Success : ButtonStyle.Danger;
        }

        const moderationLoggingButton = new ButtonBuilder()
            .setCustomId('moderationLogging')
            .setLabel('Moderation Logging')
            .setStyle(await getButtonStyle(moderationLogs))
            .setEmoji(data.emojis.adminUser);

        const messageLoggingButton = new ButtonBuilder()
            .setCustomId('messageLogging')
            .setLabel('Message Logging')
            .setStyle(await getButtonStyle(messageLogs))
            .setEmoji(data.emojis.user);

        const memberLoggingButton = new ButtonBuilder()
            .setCustomId('memberLogging')
            .setLabel('Member Logging')
            .setStyle(await getButtonStyle(memberLogs))
            .setEmoji(data.emojis.reason);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(moderationLoggingButton, messageLoggingButton, memberLoggingButton);

        const settingsEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`${guild.name} Settings`)
            .setThumbnail(guild.iconURL())
            .setDescription(`Welcome to Ares. Use this interface to configure guild related settings, such as logging. \n \nGreen buttons will indicate an active module with redbuttons being inactive, gray modules have not been configured yet.`);

        await interaction.editReply({
            embeds: [settingsEmbed],
            components: [actionRow]
        });
    }
};

export default command;