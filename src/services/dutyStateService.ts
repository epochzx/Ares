import { EmbedBuilder, ColorResolvable, ThreadChannel, TextChannel } from 'discord.js';
import { client } from '../index';
import { createDocument, deleteDocument, getDocuments, getOneDocument } from "./dbService";
import { pluralize } from '../utils/replyHelper';
import { DutyState } from '../types';
import data from '../data.json';
import { sendReminder, startReminderInterval } from '../utils/dutyStateHelper';

export async function beginDutyState(author: string, threadId: string, started: number, reminders = true): Promise<void> {
    const doc: DutyState = { threadId, author, started, reminders, ended: false };
    await createDocument('aresDutyStates', doc);

    const timerId = setTimeout(async () => {
        const document = await getOneDocument<DutyState>('aresDutyStates', { threadId: threadId });

        if (!document || document.ended) {
            clearTimeout(timerId);

            return;
        }

        await sendReminder(threadId, author, '30 minutes have elapsed, your duty state is now valid for submission.');

        startReminderInterval(threadId, author);
    }, 1800000);
    // 1800000
}

export async function reconcileDutyStates(): Promise<void> {
    const activeDutyStates = await getDocuments<DutyState>('aresDutyStates', {});

    if (!activeDutyStates.length) {
        console.log('    No active duty states');

        return;
    }

    console.log(`   ${pluralize(activeDutyStates.length, 'active duty state')}`);

    const timeNow = Math.round(Date.now() / 1000);

    for (const dutyState of activeDutyStates) {
        const { started, author, threadId } = dutyState;

        const thread = client.channels.cache.get(threadId) as ThreadChannel;

        if (!thread) { 
            await deleteDocument('aresDutyStates', { threadId: threadId });
            
            return; 
        }

        // 1800
        if (timeNow - started < 1800) {
            const delay = ((started + 1800) - timeNow) * 1000;

            const timerId = setTimeout(async () =>  {
                const thread = client.channels.cache.get(threadId) as ThreadChannel;
                const document = await getOneDocument<DutyState>('aresDutyStates', { threadId: threadId });

                if (!document || !thread) {
                    await deleteDocument('aresDutyStates', { threadId: threadId });
                    clearTimeout(timerId);

                    return;
                }

                await sendReminder(threadId, author, '30 minutes have elapsed, your duty state is now valid for submission.');

                startReminderInterval(threadId, author);
            }, delay);

        } else {
            const thread = client.channels.cache.get(threadId) as ThreadChannel;
            const document = await getOneDocument<DutyState>('aresDutyStates', { threadId: threadId });

            if (!thread) { 
                await deleteDocument('aresDutyStates', { threadId: threadId });

                return; 
            }

            if (!document) { 
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(data.colours.error as ColorResolvable)
                .setDescription(`${data.emojis.failure} Interval reminders for this duty state have been disabled due to an error.`);

            await thread.send({
                embeds: [embed]
            });
        }
    }
}

export async function handleOldDutyStateThreads(): Promise<void> {
    const dutyStatesChannel = client.channels.cache.get(data.channels.dutyStates) as TextChannel;
    const fetchedThreads = await dutyStatesChannel.threads.fetch();

    for (const thread of fetchedThreads.threads.values()) {
        const existingDutyState = await getOneDocument(`aresDutyStates`, { threadId: thread.id });
        if (existingDutyState) { continue; };

        const created = thread.createdTimestamp || 0;
        const createdSeconds = Math.floor(created / 1000);
        const existedSeconds = (Math.floor(new Date().getTime() / 1000) - createdSeconds);
        
        if (existedSeconds >= 172800) {
            try {
                await thread.delete();
            } catch {
                return;
            }
        }
    }
}