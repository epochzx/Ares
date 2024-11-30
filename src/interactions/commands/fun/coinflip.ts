import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin between heads or tails')
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]),

    execute: async (interaction) => {
        const botPermissions = [];
        
        for (const perm of Object.keys(PermissionsBitField.Flags) as Array<keyof typeof PermissionsBitField.Flags>) {
            if (interaction.appPermissions.has(PermissionsBitField.Flags[perm])) {
                botPermissions.push(perm);
            }
        }

        const ephemeral = botPermissions.includes('SendMessages') ? false : true;

        try {
            await interaction.deferReply({
                ephemeral: ephemeral
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