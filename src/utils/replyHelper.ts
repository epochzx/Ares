import { getDocuments, getOneDocument } from '../services/dbService';
import { CommandInteraction, EmbedBuilder, ButtonBuilder, Message, ActionRowBuilder, ButtonInteraction, ColorResolvable, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';
import data from '../data.json';
import { handleError } from './errorHandler';

export async function reply(state: boolean, text: string, interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction, actionRow?: ActionRowBuilder<ButtonBuilder>, deferred?: boolean, ephemeral?: boolean): Promise<void> {
    try {
        const embed = new EmbedBuilder()
            .setColor((state ? await getPrimaryColour() : (data.colours.error as ColorResolvable) ))
            .setDescription(
                state
                    ? `${data.emojis.success}  ${text}`
                    : `${data.emojis.failure}  ${text}`
            );

        ephemeral = ephemeral ?? false;

        const replyOptions = actionRow 
            ? { embeds: [embed], components: [actionRow], ephemeral: ephemeral } 
            : { embeds: [embed], ephemeral: ephemeral };

        deferred = deferred ?? true;
    
        if (deferred) {
            await interaction.editReply(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }

    } catch (error) {
        await handleError(error as Error, `Failed to reply to interaction`);
        throw new Error(`Failed to reply to interaction: ${error}`);
    }
}

export async function getPrimaryColour(): Promise<ColorResolvable> {
    const document = await getOneDocument(`savedData`, { name: 'primaryColour' });
    if (!document) { return 0; }

    return document.data as ColorResolvable;
}

export function pluralize(value: number, unit: string): string {
    return value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;
}

export function splitIntoGroups(array: Array<string>, groups: number) {
    const result = [];
    for (let i = 0; i < array.length; i += groups) {
        result.push(array.slice(i, i + groups));
    }
    return result;
}

export async function getAutoResponse(message: string): Promise<boolean | string> {
    const documents = await getDocuments(`autoResponses`, {});

    for (const autoResponse of documents) {
        if (message.toLowerCase().includes(autoResponse['prompt'].toLowerCase())) {
            return autoResponse['response'];
        }
    }

    return false;
}

export async function safelyDeleteMessage(message: Message): Promise<void> {
    try {
        await message.delete();
    } catch (error) {
        await handleError(error as Error, `Failed to delete a message`);
        return;
    }
}

export async function handleAutoResponse(message: Message): Promise<void> {
    const autoResponseResult = await getAutoResponse(message.content);

    if (autoResponseResult !== false) {
        try {
            await message.reply(autoResponseResult as string);
        } catch (error) {
            await handleError(error as Error, `Failed to reply with auto response`);
            return;
        }
    }
}
