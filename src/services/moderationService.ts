import { Infraction } from '../types';
import { handleError } from '../utils/errorHandler';
import { createDocument, getDocuments, updateDocument } from './dbService';

export async function createInfraction(targetId: string, moderatorId: string, guildId: string, action: string, reason: string, time: number, evidence: string, ends?: number | string, active?: boolean): Promise<string | boolean> {
    const doc = {
        userId: targetId,
        guildId: guildId,
        action: action,
        moderator: moderatorId,
        reason: reason,
        time: time,
        evidence: evidence,
        ...(ends && { ends }),
        ...(active && { active })
    };

    try {
        await createDocument(`infractions`, doc);
        await createDocument(`infractionAudits`, doc);
        return true;
    } catch (error) {
        return error as string;
    }
}

export async function createAudit(targetId: string, moderatorId: string, guildId: string, action: string, reason: string, time: number, evidence: string, ends?: number, active?: boolean): Promise<string | boolean> {
    const doc = {
        userId: targetId,
        guildId: guildId,
        action: action,
        moderator: moderatorId,
        reason: reason,
        time: time,
        evidence: evidence,
        ...(ends && { ends }),
        ...(active && { active })
    };

    try {
        await createDocument(`infractionAudits`, doc);
        return true;
    } catch (error) {
        return error as string;
    }
}

export async function handleUnban(targetId: string): Promise<void> {
    const userInfractions = await getDocuments<Infraction>(`infractions`, { userId: targetId, action: 'Ban', active: true });

    for (const document of userInfractions) {
         try {
            await updateDocument(`infractions`, { time: document.time }, { active: false });
         } catch (error) {
            handleError(error as Error, `Failed to update database when unbanning`);
            throw new Error(`Failed to write data to the database: ${error}`);
         } 
    }
}