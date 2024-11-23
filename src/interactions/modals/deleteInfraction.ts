import { Modal, Infraction } from "../../types";
import { ColorResolvable, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { getPrimaryColour, reply } from "../../utils/replyHelper";
import { deleteDocument, getOneDocument } from "../../services/dbService";
import { infractionToString } from "../../utils/moderationHelper";
import data from '../../data.json';
import { logModerationAction } from "../../services/loggingService";
import { createAudit } from "../../services/moderationService";

const event: Modal = {
    customId: `deleteInfraction`,

    execute: async (interaction: ModalSubmitInteraction) => {
        if (!interaction.message) { return; };

        const guild = interaction.guild;
        if (!guild) { return; }

        const reason = interaction.fields.getTextInputValue('reason');

        const embed = interaction.message.embeds[0];
        if (!embed) { return; };

        const infractionId = embed.title?.replace(/\D/g, '');
        const infraction = await getOneDocument<Infraction>(`infractions`, { time: parseInt(infractionId as string), guildId: guild.id });

        if (!infraction) {
            await reply(false, `This infraction does not exist.`, interaction, undefined, false, false);
            await interaction.message.edit({components: []});

            return;
        }

        if (infraction.active) {
            await reply(false, `You cannot delete the infraction of an active ban. Unban this user first.`, interaction, undefined, false, false);

            return;
        }

        const baseInfo = await infractionToString(infraction);

        const infractionEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`Infraction ${infractionId}`)
            .setDescription(baseInfo);

        const target = guild.members.cache.get(infraction.userId);
        if (target) {
            try {
                await target.send({
                    embeds: [infractionEmbed.setColor(data.colours.success as ColorResolvable).setTitle('Your infraction was removed')]
                });
            } catch (error) {
                console.log(`Failed to DM infraction removed embed to user: ${error}`);
            }
        }

        try {
            await deleteDocument(`infractions`, { time: parseInt(infractionId as string), guildId: guild.id });
            await reply(true, `Successfully deleted infraction \`${infractionId}\``, interaction, undefined, false, false);
        } catch (error) {
            await reply(false, `Failed to delete infraction \`${infractionId}\`: ${error}`, interaction, undefined, false, false);
        }

        try {
            await createAudit(infraction.userId as string, interaction.member?.user.id as string, guild.id, `Infraction Removed`, reason as string, Math.floor(Date.now() / 1000), `\`N/A\``);
            await logModerationAction(infraction.userId as string, interaction.member?.user.id as string, guild.id, `Infraction Removed`, reason as string, Math.floor(Date.now() / 1000), `green`, null, null, baseInfo);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this action: ${error}. <@${target?.id}>'s infraction has still been successfully deleted.`, interaction, undefined, false, false);
        }
    }
};

export default event;
