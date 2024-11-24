import { client } from "../index";
import { StatusResponse } from "../types";
import { handleError } from "../utils/errorHandler";
import data from '../data.json';
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { formatTimeSince } from "../utils/miscHelper";

export let robloxStatus = false;

export async function getStatus(): Promise<Array<string>> {
    try {
        const robloxStatus = await fetch('http://hostedstatus.com/1.0/status/59db90dbcdeb2f04dadcf16d');
        const statusResponse: StatusResponse = await robloxStatus.json();
        const overallStatus = statusResponse.result.status_overall;

        return [overallStatus.updated, overallStatus.status, overallStatus.status_code.toString()];
    } catch (error) {
        await handleError(error as Error, `Failed to get Roblox status`);
        throw new Error(`Failed to get Roblox status: ${error}`);
    }
}

async function updateStatusEmbed(status: boolean, robloxStatusMessage: string, thisStatusFor: number, lastUpdated: number): Promise<void> {
    try {
        const statusChannel = client.channels.cache.get(data.channels.robloxStatus) as TextChannel;
        if (!statusChannel) { return; }

        const statusMessage = await statusChannel.messages.fetch(data.channels.robloxStatusMessage);
        if (!statusMessage) { return; }

        if (status) {
            const embed = new EmbedBuilder()
                .setColor(data.colours.success as ColorResolvable)
                .setTitle('All Roblox Systems Operational')
                .setDescription(`${data.emojis.success} Roblox endpoints are returning as operational and all API-related systems will function as normal. \n \n` +
                    `${data.emojis.message} **Status:** \`${robloxStatusMessage}\` \n` +
                    `${data.emojis.duration} **Roblox has been incident-free for:** \`${formatTimeSince(thisStatusFor * 1000)}\` \n` +
                    `${data.emojis.time} **Last Updated:** <t:${lastUpdated}:f> (<t:${lastUpdated}:R>)`
                )
                .setThumbnail(data.images.checkmark);

            await statusMessage.edit({ content: null, embeds: [embed] });
            await statusChannel.edit({ name: '✅roblox-online' });
        } else {
            await statusChannel.send('<@366013757702275073>');

            const embed = new EmbedBuilder()
                .setColor(data.colours.error as ColorResolvable)
                .setTitle('Roblox is Down')
                .setDescription(`${data.emojis.success} Roblox has reported an issue. API-related systems have been paused until the issue is resolved. \n \n` +
                    `${data.emojis.message} **Status:** \`${robloxStatusMessage}\` \n` +
                    `${data.emojis.duration} **Roblox has been down for:** \`${formatTimeSince(thisStatusFor * 1000)}\` \n` +
                    `${data.emojis.time} **Last Updated:** <t:${lastUpdated}:f> (<t:${lastUpdated}:R>)`
                )
                .setThumbnail(data.images.error);

            await statusMessage.edit({ content: null, embeds: [embed] });
            await statusChannel.edit({ name: '❌roblox-down' });
        }
    } catch (error) {
        await handleError(error as Error, `Failed to update Roblox status embed`);
        throw new Error(`Failed to update Roblox status embed: ${error}`);
    }
}

export async function statusServiceInit(): Promise<void> {
    try {
        const currentStatus = await getStatus();
        const lastUpdatedSeconds = Math.floor((new Date().getTime()) / 1000);
        const robloxStatusLastUpdatedSeconds = Math.floor((new Date(currentStatus[0]).getTime()) / 1000);

        if (currentStatus[1] != 'Operational') {
            robloxStatus = false;
            await updateStatusEmbed(false, currentStatus[1], robloxStatusLastUpdatedSeconds, lastUpdatedSeconds);
        } else {
            robloxStatus = true;
            await updateStatusEmbed(true, currentStatus[1], robloxStatusLastUpdatedSeconds, lastUpdatedSeconds);
        }

    } catch {
        throw new Error(`Failed to update Roblox status`);
    }
}