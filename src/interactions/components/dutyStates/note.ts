import { Component } from "../../../types";
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const event: Component = {
    customId: `showNoteModal`,

    execute: async (interaction: ButtonInteraction) => {
        const existingNote = interaction.message.embeds[0].fields.filter(n => n.name == 'Notes')[0].value;

        const modal = new ModalBuilder()
            .setCustomId('addNote')
            .setTitle('Configure Note');

        const noteField = new TextInputBuilder()
            .setCustomId('noteInput')
            .setLabel('Note')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Rejoined at 13:25')
            .setValue(existingNote == `N/A` ? '' : existingNote);

        const noteActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(noteField);

        modal.addComponents(noteActionRow);
        await interaction.showModal(modal);
    }   
};

export default event;