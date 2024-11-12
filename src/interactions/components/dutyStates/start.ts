import { Component } from "../../../types";
import { ActionRowBuilder, ButtonInteraction, GuildMember, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getDivision } from "../../../utils/dutyStateHelper";

const event: Component = {
    customId: `startDutyState`,

    execute: async (interaction: ButtonInteraction) => {
        if (!interaction.member) { return; }
        const member = interaction.member as GuildMember;
        const duty = await getDivision(member.nickname ?? member.user.username);

        const modal = new ModalBuilder()
			.setCustomId('startDutyState')
			.setTitle('Begin Duty State');

        const dutyField = new TextInputBuilder()
            .setCustomId('dutyInput')
            .setLabel('Duty')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('PKSF Duties')
            .setValue(duty as string);

        const dutyPictureField = new TextInputBuilder()
            .setCustomId('dutyPictureInput')
            .setLabel('Duty Screenshot')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://picture.png');

        const tablistStartedField = new TextInputBuilder()
            .setCustomId('tablistStartedInput')
            .setLabel('Tablist Started Screenshot')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://picture.png');

        const dutyActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(dutyField);

        const dutyPictureActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(dutyPictureField);

        const tablistStartedActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(tablistStartedField);

        modal.addComponents(dutyActionRow, dutyPictureActionRow, tablistStartedActionRow);

        await interaction.showModal(modal);
    }
};

export default event;