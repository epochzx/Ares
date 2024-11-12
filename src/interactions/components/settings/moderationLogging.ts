import { getOneDocument } from "../../../services/dbService";
import { Component } from "../../../types";
import { ButtonInteraction, EmbedBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ChannelType, ButtonStyle, ActionRowBuilder } from "discord.js";
import { getPrimaryColour, reply } from "../../../utils/replyHelper";
import data from '../../../data.json';

const event: Component = {
    customId: `moderationLogging`,

    execute: async (interaction: ButtonInteraction) => {
        const author = interaction.message.interactionMetadata?.user.id;

        if (author != interaction.member?.user.id) {
            reply(false, `This button does not belong to you.`, interaction);

            return;
        }

        const guild = interaction.guild;
        if (!guild) { return; }

        const moderationLogs = await getOneDocument(`modLogs`, { guildId: guild.id });

        const settingsEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`Moderation Logging`)
            .setThumbnail(guild.iconURL())
            .setDescription(`Moderation logging handles the logging of all moderator actions, such as kicks, bans, mutes, or infractions being removed. \n \nUse the select menus below to configure how moderation logging works in this server.`);

        console.log(moderationLogs);
        console.log(guild.channels.cache.get(moderationLogs.channel)?.name);

        const placeholder = moderationLogs ? guild.channels.cache.get(moderationLogs.channel)?.name : '';

        const categorySelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('moderationLoggingChannel')
            .setChannelTypes([ChannelType.GuildText])
            .setPlaceholder(`#${placeholder as string}`);
            
        const clearButton = new ButtonBuilder()
            .setCustomId('moderationLoggingClear')
            .setLabel('Reset')
            .setStyle(ButtonStyle.Danger)
            .setEmoji(data.emojis.clear);

        const backButton = new ButtonBuilder()
            .setCustomId('settingsBack')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(data.emojis.chevronLeft);

        const firstActionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(categorySelectMenu);

        const secondActionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(clearButton, backButton);

        await interaction.message.edit({
            embeds: [settingsEmbed],
            components: [firstActionRow, secondActionRow]
        });

        await interaction.deferUpdate();
    }
};

export default event;