import { Modal } from "../../../types";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, GuildMember, ModalSubmitInteraction, TextChannel, ThreadAutoArchiveDuration, ThreadChannel } from "discord.js";
import { getTimeString } from "../../../utils/dutyStateHelper";
import { beginDutyState } from "../../../services/dutyStateService";
import { getPrimaryColour, reply } from '../../../utils/replyHelper';
import data from '../../../data.json';
import { logUserInteraction } from "../../../services/loggingService";

const event: Modal = {
    customId: `startDutyState`,

    execute: async (interaction: ModalSubmitInteraction) => {
        const dutyInput = interaction.fields.getTextInputValue('dutyInput');
        const dutyPicture = interaction.fields.getTextInputValue('dutyPictureInput');
        const tablistStarted = interaction.fields.getTextInputValue('tablistStartedInput');

        const timeNow = Math.round(new Date().getTime() / 1000);

        const member = interaction.member as GuildMember; if (!member) { return; }
        const localTime = await getTimeString(member.id);

        const endedTime = timeNow + 1800;
        const endedTimeFullFormat = `<t:${endedTime}>`;
        const endedTimeRelative = `<t:${endedTime}:R>`;

        let dutyStateThread: ThreadChannel;

        if (!(interaction.channel as TextChannel | ThreadChannel).name.includes('duty')) {
            const currentChannel = interaction.channel as ThreadChannel;
            const parentChannel = currentChannel.parent as TextChannel;

            dutyStateThread = await parentChannel.threads.create({
                name: `${member.nickname ?? member.user.username}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                type: ChannelType.PrivateThread,
                reason: 'Creating thread for duty state',
            });
        } else {
            dutyStateThread = await (interaction.channel as TextChannel).threads.create({
                name: `${member.nickname ?? member.user.username}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                type: ChannelType.PrivateThread,
                reason: 'Creating thread for duty state',
            });
        }

        if (dutyStateThread.joinable) { await dutyStateThread.join(); }

        const dutyStartedEmbed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(dutyInput)
            .setDescription('Your duty state is in progress.')
            .addFields(
                {name: 'Time Started', value: `${localTime}\n<t:${timeNow}:R>`, inline: false},
                {name: 'Duty Picture', value: dutyPicture, inline: true},
                {name: 'Tablist Started', value: tablistStarted, inline: true},
                {name: 'Notes', value: 'N/A', inline: false},
                {name: 'Other', value: `Duty state ends at ${endedTimeFullFormat} (${endedTimeRelative})`, inline: false},
            );

        const noteButton = new ButtonBuilder()
            .setCustomId('showNoteModal')
            .setLabel('Add Note')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(data.emojis.edit);

        const endButton = new ButtonBuilder()
            .setCustomId('showEndModal')
            .setLabel('End Duty')
            .setStyle(ButtonStyle.Danger)
            .setEmoji(data.emojis.end);

        const rejoinedButton = new ButtonBuilder()
            .setCustomId('rejoined')
            .setLabel('Rejoined')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(data.emojis.time);

        const disconnectedButton = new ButtonBuilder()
            .setCustomId('disconnected')
            .setLabel('Disconnected')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(data.emojis.time);

        const editImagesButton = new ButtonBuilder()
            .setCustomId('showPicturesModal')
            .setLabel('Edit Pictures')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(data.emojis.picture);

        const remindersButton = new ButtonBuilder()
            .setCustomId('toggleReminders')
            .setLabel('Reminders: On')
            .setStyle(ButtonStyle.Success)
            .setEmoji(data.emojis.timerVital);

        const actionRow2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(remindersButton, disconnectedButton, rejoinedButton, editImagesButton);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(noteButton, endButton);

        await dutyStateThread.send({
            content: `<@${member.id}>`,
            embeds: [dutyStartedEmbed],
            components: [actionRow, actionRow2], 
        });

        await beginDutyState(member.id, dutyStateThread.id, timeNow, true);
        
        if (!(interaction.channel as TextChannel | ThreadChannel).name.includes('duty')) {
            await (interaction.channel as ThreadChannel).edit({ name: 'old' });
            await reply(true, `Your duty state has started in <#${dutyStateThread.id}>. This thread will delete in 10 seconds.`, interaction, undefined, false, false);

            setTimeout(() => {
                if (interaction.channel) {
                    try { 
                        interaction.channel.delete();
                    } catch {
                        return;
                    }
                }
            }, 10000);
        } else {
            await reply(true, `Your duty state has started in <#${dutyStateThread.id}>.`, interaction, undefined, false, true);
        }

        await logUserInteraction(interaction.member as GuildMember, `started a duty state`);
    }
};

export default event;