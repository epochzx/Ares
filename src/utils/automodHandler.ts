import { Message, TextChannel } from 'discord.js';
import { safelyDeleteMessage } from './replyHelper';

// eslint-disable-next-line no-misleading-character-class, no-useless-escape
const regex = /^[A-Za-z0-9!@#$%^&*()_+{}\[\]:;"'<>=,.?\/\\|~` \-\p{Emoji}\n\u2019\u2018\u2026\u2014\u2620\uFE0F]*$/u;

export function findInvalidCharacter(string: string) {
    for (let i = 0; i < string.length; i++) {
        const char = string[i];
        if (!regex.test(char)) {
            return `Invalid character found: '${char}' at position ${i}`;
        }
    }

    return 'All characters are valid.';
}

export function automod(string: string) {
    return regex.test(string);
}

export async function handleAutoMod(message: Message): Promise<boolean> {
    const autoMod = automod(message.content);
    const channel = message.channel as TextChannel;

    if (!autoMod) {
        const automodReply = await channel.send(`<@${message.author.id}> Non-English characters are not allowed.`);
        await safelyDeleteMessage(message);

        setTimeout(async () => {
            await safelyDeleteMessage(automodReply);
        }, 10000);

        return true;
    }

    return false;
}
