import { client } from "../index";
import { StatusResponse } from "../types";
import { handleError } from "../utils/errorHandler";
import data from '../data.json';
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { formatTimeSince } from "../utils/miscHelper";

export let robloxStatus = false;

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        return response;
    } finally {
        clearTimeout(id);
    }
}

export async function getStatus(): Promise<Array<string>> {
    try {
        const robloxStatus = await fetchWithTimeout('http://hostedstatus.com/1.0/status/59db90dbcdeb2f04dadcf16d', 5000);
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

        const embed = new EmbedBuilder()
            .setColor(status ? data.colours.success as ColorResolvable : data.colours.error as ColorResolvable)
            .setTitle(status ? 'All Roblox Systems Operational' : 'Roblox Service Disruption')
            .setDescription(
                `${status ? data.emojis.success : data.emojis.failure} ${status ? 'Roblox endpoints are operational.' : 'Roblox has reported an issue.'} \n\n` +
                `${data.emojis.message} **Status:** \`${robloxStatusMessage}\` \n` +
                `${data.emojis.duration} **Roblox has been ${status ? 'incident-free' : 'down'} for:** \`${formatTimeSince(thisStatusFor * 1000)}\` \n` +
                `${data.emojis.time} **Last Updated:** <t:${lastUpdated}:f> (<t:${lastUpdated}:R>)`
            )
            .setThumbnail(status ? data.images.checkmark : data.images.error);

        await statusMessage.edit({ content: null, embeds: [embed] });

        const channelName = status ? '✅roblox-online' : '❌roblox-down';
        await statusChannel.edit({ name: channelName });

        if (!status) {
            await statusChannel.send('<@366013757702275073>');
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