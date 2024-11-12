import { Modal } from "../../../types";
import { ActionRowBuilder, ButtonBuilder, ButtonComponent, EmbedBuilder, GuildMember, ModalSubmitInteraction } from "discord.js";
import { reply } from "../../../utils/replyHelper";
import { logUserInteraction } from "../../../services/loggingService";

const event: Modal = {
    customId: `addNote`,

    execute: async (interaction: ModalSubmitInteraction) => {
        const newNote = interaction.fields.getTextInputValue('noteInput');

        if (!interaction.message) { return; }
        const oldEmbed = interaction.message.embeds[0];
        if (!oldEmbed) { return; }

        const newEmbed = EmbedBuilder.from(oldEmbed).setFields(
            {name: 'Time Started', value: oldEmbed.fields[0].value, inline: false},
            {name: 'Duty Picture', value: oldEmbed.fields[1].value, inline: true},
            {name: 'Tablist Started', value: oldEmbed.fields[2].value, inline: true},
            {name: 'Notes', value: newNote, inline: false},
            {name: 'Other', value: oldEmbed.fields[4].value, inline: false},
        );

        const noteButton = ButtonBuilder.from(interaction.message.components[0].components[0] as ButtonComponent)
            .setLabel('Edit Note');

        const endDutyButton = ButtonBuilder.from(interaction.message.components[0].components[1] as ButtonComponent);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(noteButton, endDutyButton);
            
        const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(interaction.message.components[1].components.map((component) => 
                ButtonBuilder.from(component as ButtonComponent)
            ))
        );

        await interaction.message.edit({
            embeds: [newEmbed],
            components: [actionRow, actionRow2]
        });
 
        await reply(true, `Successfully edited your duty state note.`, interaction, undefined, false, true);
        await logUserInteraction(interaction.member as GuildMember, `edited their duty state note`);
    }
};

export default event;