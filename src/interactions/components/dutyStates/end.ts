import { Component } from "../../../types";
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const event: Component = {
    customId: `showEndModal`,

    execute: async (interaction: ButtonInteraction) => {
        if (!interaction.member) { return; }

        const modal = new ModalBuilder()
			.setCustomId('endDutyState')
			.setTitle('End Duty State');

        const tablistEnded = new TextInputBuilder()
            .setCustomId('tablistEndedInput')
            .setLabel('Tablist Ended Screenshot')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://picture.png');

        const tablistEndedRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(tablistEnded);

        modal.addComponents(tablistEndedRow);

        await interaction.showModal(modal);
    }
};

export default event;