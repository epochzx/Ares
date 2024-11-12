import { ColorResolvable, EmbedBuilder, TextChannel } from 'discord.js';
import data from '../data.json';
import { client } from '../index';

export async function handleError(error: Error, title?: string): Promise<void> {
    const errorMessage = error.message;
    const stack = error.stack || '';
    const stackLines = stack.split('\n');
    let origin = 'unknown origin';

    if (stackLines[1]) {
        // eslint-disable-next-line no-useless-escape
        const match = stackLines[1].match(/[\\\/]([^\\\/]+):(\d+):(\d+)/);
        if (match) {
            const fileName = match[1];
            const lineNumber = match[2];
            const columnNumber = match[3];
            origin = `${fileName}:${lineNumber}:${columnNumber}`;
        } else {
            origin = stackLines[1] ? stackLines[1].trim() : 'unknown origin';
        }
    }

    const errorEmbed = new EmbedBuilder()
        .setColor(data.colours.error as ColorResolvable)
        .setTitle(title ?? 'Error Stack Trace')
        .setDescription(`❌ **Error** \n\`\`\`\n${errorMessage}\n\`\`\`\n` +
            `📝 **Origin** \n\`\`\`ts\n${origin}\n\`\`\`\n` +
            `📜 **Stack Trace** \n\`\`\`ts\n${stack}\n\`\`\`\n`
        );

    if (client.isReady()) {
        const errorChannel = await client.channels.fetch(data.channels.errorLogging) as TextChannel;

        const message = await errorChannel.send({
            embeds: [errorEmbed]
        });

        await message.crosspost();
    } else {
        return;
    }
}