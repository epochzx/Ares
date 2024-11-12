import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Component } from '../../types';
import { reply } from '../../utils/replyHelper';

const event: Component = {
    customId: `deleteInfraction`,

    execute: async (interaction: ButtonInteraction) => {
        const member = interaction.member;
        if (!member) { return; }
        if (!interaction.message.interactionMetadata) { return; }

        if (member.user.id != interaction.message.interactionMetadata.user.id) { 
            await reply(false, `This button does not belong to you.`, interaction, undefined, false, true);

            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('deleteInfraction')
            .setTitle('Delete Infraction');
    
        const reasonField = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Reason')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Reason for deleting infraction')
            .setRequired(true);

        const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reasonField);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }
};

export default event;