import { Modal } from "../../../types";
import { ActionRowBuilder, ButtonBuilder, ButtonComponent, EmbedBuilder, GuildMember, ModalSubmitInteraction } from "discord.js";
import { reply } from "../../../utils/replyHelper";
import { logUserInteraction } from "../../../services/loggingService";

const event: Modal = {
    customId: `editPictures`,

    execute: async (interaction: ModalSubmitInteraction) => {
        const dutyPicture = interaction.fields.getTextInputValue('dutyPicture');
        const tablistStarted = interaction.fields.getTextInputValue('tablistStarted');

        if (!interaction.message) { return; }
        const oldEmbed = interaction.message.embeds[0];
        if (!oldEmbed) { return; }

        const newEmbed = EmbedBuilder.from(oldEmbed)
            .setFields(
                {name: 'Time Started', value: oldEmbed.fields[0].value, inline: false},
                {name: 'Duty Picture', value: dutyPicture, inline: true},
                {name: 'Tablist Started', value: tablistStarted, inline: true},
                {name: 'Notes', value: oldEmbed.fields[3].value, inline: false},
                {name: 'Other', value: oldEmbed.fields[4].value, inline: false},
            );

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(interaction.message.components[0].components.map((component) => 
                ButtonBuilder.from(component as ButtonComponent)
            ))
        );
            
        const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(interaction.message.components[1].components.map((component) => 
                ButtonBuilder.from(component as ButtonComponent)
            ))
        );

        await interaction.message.edit({
            embeds: [newEmbed],
            components: [actionRow, actionRow2]
        });
 
        await reply(true, `Successfully edited your duty state pictures.`, interaction, undefined, false, true);
        await logUserInteraction(interaction.member as GuildMember, `edited their duty state pictures`);
    }
};

export default event;