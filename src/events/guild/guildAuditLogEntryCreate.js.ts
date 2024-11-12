import { Events, AuditLogEvent, Guild, GuildAuditLogsEntry } from 'discord.js';
import { BotEvent } from '../../types';
import { createAudit, createInfraction, handleUnban } from '../../services/moderationService';
import { logModerationAction } from '../../services/loggingService';
import { formatTimeUntil } from '../../utils/miscHelper';
import { client } from '../../index';

const event: BotEvent = {
    name: Events.GuildAuditLogEntryCreate,
    once: false,

    execute: async (auditLog: GuildAuditLogsEntry, guild: Guild) => {
        if (auditLog.executorId == client.user?.id) { return; }

        const infractionId = Math.floor(Date.now() / 1000);

        switch (auditLog.action) {
            case AuditLogEvent.MemberKick: {
                await logModerationAction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Kick (Manual)`, auditLog.reason ?? `No reason specified`, infractionId, `red`);
                await createInfraction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Kick`, auditLog.reason ?? `No reason specified`, infractionId, `\`None\``);
            
                break;
            }

            case AuditLogEvent.MemberBanAdd: {
                await logModerationAction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Ban (Manual)`, auditLog.reason ?? `No reason specified`, infractionId, `red`);
                await createInfraction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Ban`, auditLog.reason ?? `No reason specified`, infractionId, `\`None\``, `\`PERM\``, true);
            
                break;
            }

            case AuditLogEvent.MemberBanRemove: {
                await logModerationAction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Unban (Manual)`, auditLog.reason ?? `No reason specified`, infractionId, `green`);
                await createAudit(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Unban`, auditLog.reason ?? `No reason specified`, infractionId, `\`None\``);
                await handleUnban(auditLog.targetId as string);

                break;
            }

            case AuditLogEvent.MemberUpdate: {
                if (auditLog.changes[0].key === 'communication_disabled_until') {
                    const member = guild.members.cache.get(auditLog.targetId as string);

                    // unmute
                    if (member?.communicationDisabledUntil === null) {
                        await logModerationAction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Unmute (Manual)`, auditLog.reason ?? `No reason specified`, infractionId, `green`);
                        await createAudit(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Unmute`, auditLog.reason ?? `No reason specified`, infractionId, `\`None\``);
                    } 

                    // mute
                    else {
                        const unmuteTimeMilliseconds = Math.floor(new Date(auditLog.changes[0].new as string).getTime());
                        const unmuteTimeHumanFormat = formatTimeUntil(unmuteTimeMilliseconds, infractionId * 1000);

                        await createInfraction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Mute`, auditLog.reason ?? `No reason specified`, infractionId, `\`None\``, unmuteTimeMilliseconds);
                        await logModerationAction(auditLog.targetId as string, auditLog.executorId as string, guild.id, `Mute (Manual)`, auditLog.reason ?? `No reason specified`, infractionId, `red`, `\`None\``, unmuteTimeHumanFormat);
                    }
                }

                break;
            }

            default: {
                return;
            }
        }
    },
};

export default event;
