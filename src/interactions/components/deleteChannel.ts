import { ButtonInteraction } from 'discord.js';
import { Component } from '../../types';

const event: Component = {
    customId: `deleteChannel`,

    execute: async (interaction: ButtonInteraction) => {
        try {
            await interaction.channel?.delete();
        } catch {
            return;
        }
    }
};

export default event;