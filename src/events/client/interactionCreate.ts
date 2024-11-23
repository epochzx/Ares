import { BotEvent } from '../../types';
import { client } from '../../index';
import { handleError } from '../../utils/errorHandler';
import { modalInteractions, componentInteractions } from '../../handlers/interactionHandler';

const event: BotEvent = {
    name: 'interactionCreate',
    once: false,
    guild: false,

    execute: async (interaction) => {
        if (interaction.replied || interaction.deferred) {
            return;
        }

        if (interaction.type == 2) { // commands
            const command = client.commands.get(interaction.commandName);

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌  Failed to execute command ${interaction.commandName}: ${error}`);
                await handleError(error as Error, `Failed to execute command ${interaction.commandName}`);
            }
        } else 

        if (interaction.type == 3) { // buttons and select menus
            const component = componentInteractions.get(interaction.customId);
            if (!component) return;

            try {
                component.execute(interaction);
            } catch (error) {
                console.error(`❌  Failed to execute component ${interaction.customId}: ${error}`);
                await handleError(error as Error, `Failed to execute component ${interaction.customId}`);
            }
        } else 

        if (interaction.type == 5) { // modals
            const modal = modalInteractions.get(interaction.customId);
            if (!modal) return;

            try {
                modal.execute(interaction);
            } catch (error) {
                console.error(`❌  Failed to execute modal ${interaction.customId}: ${error}`);
                await handleError(error as Error, `Failed to execute modal ${interaction.customId}`);
            }
        }
    },
};

export default event;
