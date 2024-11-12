import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin between heads or tails')
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]),

    execute: async (interaction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }

        const options = [`Heads!`, `Tails!`];
        const random = Math.floor(Math.random() * options.length);

        await reply(true, options[random], interaction);
    }
};

export default command;