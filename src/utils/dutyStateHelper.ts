import { deleteDocument, getOneDocument } from "../services/dbService";
import noblox from 'noblox.js';
import data from '../data.json';
import { handleError } from "./errorHandler";
import { client } from '../index';
import { ThreadChannel } from 'discord.js';
import { UserTimezone, DutyState } from '../types';
import { robloxStatus } from "../services/robloxStatusService";

export async function getTimeString(userId: string): Promise<string> {
    function getTime(offset: number) {
        const currentGMT = new Date();
        const gmtMilliseconds = currentGMT.getTime();
        const timeZoneOffset = offset * 60 * 60 * 1000;
        const newTimeMilliseconds = gmtMilliseconds + timeZoneOffset;
      
        const newTime = new Date(newTimeMilliseconds);
      
        const hours = newTime.getUTCHours().toString().padStart(2, '0');
        const minutes = newTime.getUTCMinutes().toString().padStart(2, '0');
      
        return `${hours}:${minutes}`;
    }
    
    const userTimezone = await getOneDocument<UserTimezone>(`timezones`, {userId: userId});
    if (!userTimezone) { return 'GMT'; }
    
    let offset;
    let suffix;
    
    if (Object.is(userTimezone, null)) {
        offset = '0';
    } else {
        offset = userTimezone['gmtOffset'];
    }
    
    if (offset == '0') {
        suffix = 'GMT';
    } else {
        if (!offset.startsWith('-')) {
            suffix = `GMT+${offset}`;
        } else {
            suffix = `GMT${offset}`;
        }
    }

    return `${getTime(parseInt(offset))} ${suffix}`;
}

export async function getDivision(username: string): Promise<string> {
    if (!robloxStatus) {
        return `Guarding the border`;
    }

    try {
        const userId = await noblox.getIdFromUsername(username);
        const groups = await noblox.getGroups(userId);

        const aegisGroupIds = Object.values(data.dod.groupIds);
        const matchingGroups = groups.filter(group => aegisGroupIds.includes(group.Id));

        if (matchingGroups.length == 0) {
            return 'Guarding the border';
        }

        if (matchingGroups.length > 1) {
            const lowestRankGroup = matchingGroups.reduce((minGroup, currentGroup) => 
                currentGroup.Rank < minGroup.Rank ? currentGroup : minGroup
            );
            
            const lowestGroupKey = Object.entries(data.dod.groupIds).find(
                ([, id]) => id === lowestRankGroup.Id
            )?.[0];
            
            return lowestGroupKey ? `${lowestGroupKey} duties` : 'Guarding the border';
        } else {
            return `${Object.keys(data.dod.groupIds).find(key => data.dod.groupIds[key as keyof typeof data.dod.groupIds] === matchingGroups[0].Id)} duties`;
        }

    } catch (error) {
        await handleError(error as Error, `Failed to get user's Aegis division`);
        return 'Guarding the border';
    }
}

export async function sendReminder(threadId: string, author: string, message: string): Promise<void> {
    const dutyStateThread = client.channels.cache.get(threadId) as ThreadChannel;

    if (!dutyStateThread) {
        await deleteDocument('aresDutyStates', { threadId: threadId });

        return;
    }

    await dutyStateThread.send({ content: `<@${author}> ${message}` });
}

export function startReminderInterval(threadId: string, author: string): NodeJS.Timeout {
    const intervalId = setInterval(async () => {

        const document = await getOneDocument<DutyState>('aresDutyStates', { threadId });
        const dutyStateThread = client.channels.cache.get(threadId) as ThreadChannel;

        if (!document || !dutyStateThread || document.ended) {
            clearInterval(intervalId);

            if (document) { 
                await deleteDocument('aresDutyStates', { threadId: threadId });
            }

            return;
        }

        if (document.reminders) {
            await sendReminder(threadId, author, 'periodic reminder');
        }
    }, 1800000);
    // 1800000

    return intervalId;
}
