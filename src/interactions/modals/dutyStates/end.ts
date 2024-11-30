import { Modal, DutyState } from "../../../types";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, ModalSubmitInteraction } from "discord.js";
import { getTimeString } from "../../../utils/dutyStateHelper";
import { deleteDocument, getOneDocument } from "../../../services/dbService";
import { formatTimeSince } from "../../../utils/miscHelper";
import data from '../../../data.json';
import { logUserInteraction } from "../../../services/loggingService";
import { getPrimaryColour } from "../../../utils/replyHelper";

const event: Modal = {
    customId: `endDutyState`,

    execute: async (interaction: ModalSubmitInteraction) => {
        if (!interaction.message) { return; }
        if (!interaction.member) { return; }
        if (!interaction.channel) { return; }

        const tablistEnded = interaction.fields.getTextInputValue('tablistEndedInput');
        const timeNow = await getTimeString(interaction.member?.user.id as string);
        
        let title = interaction.message.embeds[0].title;

        if (interaction.member?.user.id == '366013757702275073') {
            title = 'PKSF Duties';
        }
        
        const dutyStateDocument = await getOneDocument<DutyState>(`aresDutyStates`, { threadId: interaction.channel.id });
        if (!dutyStateDocument) { return; }

        const dutyPicture = interaction.message.embeds[0].fields.filter(n => n.name == 'Duty Picture')[0].value;
        const tablistStarted = interaction.message.embeds[0].fields.filter(n => n.name == 'Tablist Started')[0].value;
        const notes = interaction.message.embeds[0].fields.filter(n => n.name == 'Notes')[0].value;

        // human format time string
        const timeStarted = interaction.message.embeds[0].fields.filter(n => n.name == 'Time Started')[0].value.split('\n')[0];

        const endedTime = Math.round(new Date().getTime() / 1000);
        const duration = formatTimeSince(Math.floor(dutyStateDocument.started * 1000));
        const durationSeconds = endedTime - dutyStateDocument.started;

        let username = (interaction.member as GuildMember).nickname ?? interaction.member.user.username;

        if (interaction.member.user.id == '366013757702275073') {
            username = 'ZenithVale';
        }

        let dutyStateDescription = `Username: ${username} \n` +
            `Duty: ${title} \n${dutyPicture} \n \n` +
            `Time Started: ${timeStarted} \n` +
            `Tablist Started: ${tablistStarted} \n \n` +
            `Time Ended: ${timeNow} \n` +
            `Tablist Ended: ${tablistEnded}`;

        if (notes != 'N/A') {
            dutyStateDescription += `\n \nNotes: ${notes}`;
        }

        const breakpoints = [0, 1800, 14400, 21600, 28800, 36000];
        let expectedPoints;

        for (let i = 0; i < breakpoints.length - 1; i++) {
            if (durationSeconds >= breakpoints[i] && durationSeconds <= breakpoints[i + 1]) {
                expectedPoints = i;
                break;
            }
        }

        const dutyStateEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`Completed Duty State`)
            .setDescription(dutyStateDescription);

        const statsEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle('Duty State Statistics')
            .setDescription(`${data.emojis.timer} **Duty State Duration:** ${duration} \n` +
                    `${data.emojis.checkBox} **Expected Points:** ${expectedPoints}`
            );

        const deleteButton = new ButtonBuilder()
            .setCustomId('deleteChannel')
            .setStyle(ButtonStyle.Danger)
            .setLabel(`Delete`)
            .setEmoji(data.emojis.delete);

        const anotherDutyButton = new ButtonBuilder()
            .setCustomId('startDutyState')
            .setLabel('Start Another Duty State')
            .setStyle(ButtonStyle.Success)
            .setEmoji(data.emojis.play);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(anotherDutyButton, deleteButton);

        await interaction.message.edit({
            embeds: [dutyStateEmbed, statsEmbed],
            components: [actionRow]
        });

        await deleteDocument(`aresDutyStates`, { threadId: interaction.channel.id });
        await interaction.deferUpdate();
        await logUserInteraction(interaction.member as GuildMember, `ended a duty state`);
    }
};

export default event;