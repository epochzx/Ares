import { getOneDocument, updateDocument } from "../../../services/dbService";
import { Component, DutyState } from "../../../types";
import { ActionRowBuilder, ButtonInteraction, ButtonBuilder, ButtonStyle, ButtonComponent, GuildMember } from "discord.js";
import { handleError } from "../../../utils/errorHandler";
import { reply } from "../../../utils/replyHelper";
import { logUserInteraction } from "../../../services/loggingService";

const event: Component = {
    customId: `toggleReminders`,

    execute: async (interaction: ButtonInteraction) => {
        if (!interaction.member) { return; }
        if (!interaction.channel) { return; }
        
        const document = await getOneDocument<DutyState>(`aresDutyStates`, { threadId: interaction.channel.id });
        if (!document) { return; }

        try {
            await updateDocument(`aresDutyStates`, { threadId: interaction.channel.id }, { reminders: !document.reminders });
        } catch (error) {
            handleError(error as Error, `Failed to update database when toggling reminders`);
            throw new Error(`Failed to write data to the database: ${error}`);
        }
        
        const originalMessage = interaction.message;

        const topButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(originalMessage.components[0].components.map((component) => 
                ButtonBuilder.from(component as ButtonComponent)
            ))
        );
        
        const bottomButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(originalMessage.components[1].components.map((component) => 
                ButtonBuilder.from(component as ButtonComponent)
            ))
        );

        const newStyle = !document.reminders ? ButtonStyle.Success : ButtonStyle.Danger;
        const newState = !document.reminders ? 'On' : 'Off';

        const newReminderButton = ButtonBuilder.from(originalMessage.components[1].components[0] as ButtonComponent)
            .setStyle(newStyle)
            .setLabel(`Reminders: ${newState}`);

        bottomButtons.setComponents(newReminderButton, ...bottomButtons.components.slice(1));

        await interaction.message.edit({
            components: [topButtons, bottomButtons]
        });

        await reply(true, !document.reminders == false ? 
            `Reminders have been turned off. You will be pinged after your duty state is eligible for submission, but will not receive follow up pings every 30 minutes.` : 
            `Reminders have been turned on. You will receive follow up pings every 30 minutes after your duty state is eligible for submission.`, interaction, undefined, false, true);

        await logUserInteraction(interaction.member as GuildMember, `toggled their duty state reminders`);
    }
};

export default event;