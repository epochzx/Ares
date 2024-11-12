import { ColorResolvable, EmbedBuilder, GuildMember, Message, TextChannel } from 'discord.js';
import { handleError } from '../utils/errorHandler';
import data from '../data.json';
import { automod, findInvalidCharacter } from '../utils/automodHandler';
import { getOneDocument } from './dbService';
import { client } from '../index';
import { getPrimaryColour } from '../utils/replyHelper';

export async function logModerationAction(targetId: string, moderatorId: string, guildId: string, action: string, reason: string, time: number, colour: string, evidence?: string | null, duration?: string | null, extra?: string | null): Promise<EmbedBuilder | undefined> {
    const colourMap: { [key: string]: string } = {
        red: data.colours.error,
        yellow: data.colours.caution,
        green: data.colours.success,
    };
    

    const embedColour = colourMap[colour];

    const guildLogs = await getOneDocument(`modLogs`, { guildId: guildId });
    if (!guildLogs) { return; }

    let logDescription: string;

    if (guildLogs.enabled) {
        logDescription = `
                ${data.emojis.user} **User:** <@${targetId}> (\`${targetId}\`) \n` +
                `${data.emojis.adminUser} **Moderator:** <@${moderatorId}> (\`${moderatorId}\`) \n` +
                `${data.emojis.reason} **Reason:** \`${reason}\` \n`;

        if (duration) {
            logDescription += `${data.emojis.timer} **Duration:** \`${duration}\` \n`;
        }

        if (evidence) {
            logDescription += `${data.emojis.picture} **Evidence:** ${evidence} \n`;
        }

        if (extra) {
            logDescription += `\n ${extra}`;
        }

        const guild = await client.guilds.fetch(guildId);
        const moderator = await guild.members.fetch(moderatorId);

        const log = new EmbedBuilder()
            .setColor(embedColour as ColorResolvable)
            .setTitle(action)
            .setAuthor({
                name: moderator.user.username, 
                iconURL: `https://cdn.discordapp.com/avatars/${moderator.user.id}/${moderator.user.avatar}.png?size=256`
            })
            .setDescription(logDescription)
            .setTimestamp();

        const excludedActions = [
            'Unmute', 
            'Infractions Cleared', 
            'Infraction Removed', 
            'Unban', 
            'Unban (Manual)', 
            'Unmute (Manual)'
        ];
            
        if (!excludedActions.includes(action)) {
            log.setFooter({text: `Infraction ID: ${time}`});
        }

        try {
            const channel = client.channels.cache.get(guildLogs.channel) as TextChannel;
            await channel.send({
                embeds: [log]
            });

            return log;
        } catch (error) {
            await handleError(error as Error, `Failed to send a moderator action log`);

            return;
        }
    }
}

export async function logMemberJoinOrLeave(member: GuildMember, joined: boolean, logChannel: TextChannel): Promise<void> {
    const colour = joined ? data.colours.success : data.colours.error;
    const status = joined ? `joined` : `left`;
    const statusEmoji = joined ? data.emojis.success : data.emojis.failure;

    const embed = new EmbedBuilder()
        .setColor(colour as ColorResolvable)
        .setDescription(`${statusEmoji} <@${member.user.id}> (\`${member.user.id}\`) has ${status}`)
        .setAuthor({
            name: member.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=256`
        });

    try {
        await logChannel.send({
            embeds: [embed]
        });
    } catch (error) {
        handleError(error as Error, `Failed to log a member join/leave event`);

        return;
    }
}

export async function logDeletedMessage(message: Message, logChannel: TextChannel): Promise<void> {
    let contentToLog;
    let image = false;
    let title = `Message Deleted`;
    let regexMatch;

    try {
        if (message.content.length === 0) {
            if (message.poll) {
                contentToLog = `[Sent a poll]`;
            } else if (message.activity) {
                contentToLog = `[Sent a Discord activity invite]`;
            } else if (message.stickers.size > 0) {
                contentToLog = `[Sent a sticker]`;
            } else if (message.attachments.size > 0) {
                const messageType = message.attachments.first()?.contentType;
                if (!messageType) return;
        
                const attachmentName = message.attachments.first()?.name;
                if (messageType.startsWith('audio')) {
                    contentToLog = `[Sent an audio file ${attachmentName}]`;
                } else if (messageType.startsWith('image')) {
                    image = true;
                    contentToLog = `[Sent an image]`;
                } else {
                    contentToLog = `[Uploaded a file ${attachmentName}]`;
                }
            } else {
                contentToLog = `[Unknown message type]`;
            }
        } else {
            contentToLog = message.content;

            if (!automod(message.content)) {
                title = `Automod Trigger Deletion`;
                regexMatch = findInvalidCharacter(message.content);
            }
        };
    } catch (error) {
        await handleError(error as Error, `Failed to log a deleted message`);

        return;
    };

    contentToLog = contentToLog.replace(/`/g, '');

    let embedDescription;
    embedDescription = `${data.emojis.send} **Message:** \n\`\`\`\n${contentToLog}\n\`\`\` \n`;

    if (!automod(message.content)) {
        embedDescription += `${data.emojis.sendCancel} **Flagged Content:** \n\`\`\`js\n${regexMatch}\n\`\`\` \n`;
    }

    embedDescription += `${data.emojis.user} **Author:** <@${message.author.id}> (\`${message.author.id}\`) \n` +
                        `${data.emojis.message} **Channel:** <#${message.channel.id}> (\`${message.channel.id}\`)`;

    const embed = new EmbedBuilder()
        .setColor(data.colours.error as ColorResolvable)
        .setTitle(title)
        .setAuthor({name: message.author.username, iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=256`})
        .setDescription(embedDescription)
        .setTimestamp();

    if (image) {
        embed.setThumbnail(message.attachments.first()?.url as string);
    }

    try {
        await logChannel.send({
            embeds: [embed]
        });
    } catch (error) {
        handleError(error as Error, `Failed to log a message delete event`);

        return;
    }
}

export async function logEditedMessage(oldMessage: Message, newMessage: Message, logChannel: TextChannel): Promise<void> {
    if (!oldMessage.content || !newMessage.content) { return; }
    if (oldMessage.content == newMessage.content) { return; }

    const oldMessageToLog = oldMessage.content.replace(/`/g, '');
    const newMessageToLog = newMessage.content.replace(/`/g, '');

    const embed = new EmbedBuilder()
        .setColor(data.colours.blue as ColorResolvable)
        .setTitle('Message Edited')
        .setAuthor({name: newMessage.author.username, iconURL: `https://cdn.discordapp.com/avatars/${newMessage.author.id}/${newMessage.author.avatar}.png?size=256`})
        .setDescription(`${data.emojis.send} **New Message:** \n\`\`\`\n${newMessageToLog}\n\`\`\` \n` +
            `${data.emojis.sendCancel} **Old Message:** \n\`\`\`\n${oldMessageToLog}\n\`\`\` \n` +
            `${data.emojis.user} **Author:** <@${newMessage.author.id}> (\`${newMessage.author.id}\`) \n` +
            `${data.emojis.message} **Channel:** <#${newMessage.channel.id}> (\`${newMessage.channel.id}\`)`)
        .setTimestamp();
    
    try {
        await logChannel.send({
            embeds: [embed]
        });
    } catch (error) {
        handleError(error as Error, `Failed to log a message update event`);

        return;
    }
}

export async function logUserInteraction(member: GuildMember, action: string): Promise<void> {
    const logChannel = client.channels.cache.get(data.channels.interactionLogging) as TextChannel;

    const embed = new EmbedBuilder()
        .setColor(await getPrimaryColour())
        .setAuthor({
            name: member.nickname ?? member.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=256`
        })
        .setDescription(`<@${member.user.id}> (\`@${member.nickname ?? member.user.username}\`) has ${action}`);

    await logChannel.send({
        embeds: [embed]
    });
}