import { Component } from "../../../types";
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const event: Component = {
    customId: `showPicturesModal`,

    execute: async (interaction: ButtonInteraction) => {
        if (!interaction.message) { return; }
        const embed = interaction.message.embeds[0];

        const dutyPicture = embed.fields.filter(n => n.name == 'Duty Picture')[0].value;
        const tablistStarted = embed.fields.filter(n => n.name == 'Tablist Started')[0].value;

        const modal = new ModalBuilder()
            .setCustomId('editPictures')
            .setTitle('Edit Pictures');
        
        const dutyField = new TextInputBuilder()
            .setCustomId('dutyPicture')
            .setLabel('Duty Picture')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://picture.png')
            .setValue(dutyPicture)
            .setRequired(true);

        const tablistfield = new TextInputBuilder()
            .setCustomId('tablistStarted')
            .setLabel('Tablist Started')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://picture.png')
            .setValue(tablistStarted)
            .setRequired(true);

        const dutyActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(dutyField);

       const tablistActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(tablistfield);

        modal.addComponents(dutyActionRow, tablistActionRow);

        await interaction.showModal(modal);
    }   
};

export default event;