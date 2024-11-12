import { createDocument, getOneDocument, updateDocument } from "../../../services/dbService";
import { Component } from "../../../types";
import { StringSelectMenuInteraction } from "discord.js";
import { reply } from "../../../utils/replyHelper";
import { handleError } from "../../../utils/errorHandler";

const event: Component = {
    customId: `timezoneSelect`,

    execute: async (interaction: StringSelectMenuInteraction) => {
        if (!interaction.member) { return; }
        await interaction.message.edit({});

        let selectedTimezone = interaction.values.toString();
        const rawSelectedTimezone = interaction.values.toString();

        selectedTimezone = selectedTimezone.replace('GMT', '');
        
        if (selectedTimezone.charAt(0) == '+') {
            selectedTimezone = selectedTimezone.slice(1);
        }

        const userTimezone = await getOneDocument(`timezones`, { userId: interaction.member.user.id });

        if (!userTimezone) {
            const doc = {
                userId: interaction.member.user.id,
                gmtOffset: selectedTimezone,
            };

            try {
                await createDocument(`timezones`, doc);
                await reply(true, `Successfully set your timezone to ${rawSelectedTimezone}, This will apply to <#1201847692649840671> and <#1208276795124748288>.`, interaction, undefined, false, true);
            } catch (error) {
                await handleError(error as Error, `Failed to set user timezone`);
                await reply(false, `Failed to set your timezone: ${error}`, interaction, undefined, false, true);
            }
        } else {
            const currentTimezone = userTimezone.gmtOffset;

            if (currentTimezone == selectedTimezone) {
                await reply(false, `Your timezone is already set to ${rawSelectedTimezone}.`, interaction, undefined, false, true);

                return;
            }

            await updateDocument(`timezones`, { userId: interaction.member.user.id }, { gmtOffset: selectedTimezone });
            await reply(true, `Successfully set your timezone to ${rawSelectedTimezone}, This will apply to <#1201847692649840671> and <#1208276795124748288>.`, interaction, undefined, false, true);
        }
    }
};

export default event;