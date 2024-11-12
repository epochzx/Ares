import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import { SlashCommand } from '../../../types';
import { client } from '../../../index';
import data from '../../../data.json';
import { memoryUsage } from 'process';
import { formatTimeSince } from '../../../utils/miscHelper';
import { getPrimaryColour } from '../../../utils/replyHelper';

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot ping and uptime information')
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]),

    execute: async (interaction: CommandInteraction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }
        
        const uptime = client.readyTimestamp ?? 0;
        const apiLatency = Math.round(client.ws.ping);

        const environment = process.env.environment;

        const memory = Math.floor(memoryUsage.rss() / 1000000);
        const memoryEmoji = 
            memory < 80 ? data.emojis.success :
            memory < 100 ? data.emojis.caution :
            data.emojis.failure;

        let clientLatency = Date.now() - interaction.createdTimestamp;

        if (clientLatency < 0) {
            clientLatency = clientLatency * -1;
        }

        const embed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`${client.user?.username} Ping Data`)
            .setThumbnail(data.images.ares)
            .addFields(
                {name: 'Client Latency', value: `${clientLatency} ms`, inline: true},
                {name: 'API Latency', value: `${apiLatency} ms`, inline: true},
                {name: 'Uptime', value: `${formatTimeSince(uptime)}`, inline: false},
                {name: 'Memory Usage', value: `${memoryEmoji} ${memory} MB`, inline: false},
                {name: 'Current Environment', value: environment as string, inline: false},
            );

        try {
            await interaction.editReply({
                content: null,
                embeds: [embed]
            });
        } catch {
            return;
        }
    }
};

export default command;