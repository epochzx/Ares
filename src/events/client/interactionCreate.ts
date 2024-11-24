import { BotEvent } from '../../types';
import { client } from '../../index';
import { handleError } from '../../utils/errorHandler';
import { modalInteractions, componentInteractions } from '../../handlers/interactionHandler';
import { reply } from '../../utils/replyHelper';

const event: BotEvent = {
    name: 'interactionCreate',
    once: false,
    guild: false,

    execute: async (interaction) => {
        if (interaction.replied || interaction.deferred) {
            return;
        }

        const type = interaction.type;

        switch (type) {
            case 2: { // commands
                const command = client.commands.get(interaction.commandName);
                if (!command) { return; }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(`❌  Failed to execute command ${interaction.commandName}: ${error}`);
                    await handleError(error as Error, `Failed to execute command ${interaction.commandName}`);

                    if (interaction.deferred) {
                        await reply(false, `Failed to execute command ${interaction.commandName}: ${error}`, interaction, undefined, true, false);
                    } else {
                        await reply(false, `Failed to execute command ${interaction.commandName}: ${error}`, interaction, undefined, false, false);
                    }
                }

                break;
            }

            case 3: { // buttons and select menus
                const component = componentInteractions.get(interaction.customId);
                if (!component) return;

                try {
                    component.execute(interaction);
                } catch (error) {
                    console.error(`❌  Failed to execute component ${interaction.customId}: ${error}`);
                    await handleError(error as Error, `Failed to execute component ${interaction.customId}`);

                    if (interaction.deferred) {
                        await reply(false, `Failed to execute component ${interaction.commandName}: ${error}`, interaction, undefined, true, false);
                    } else {
                        await reply(false, `Failed to execute component ${interaction.commandName}: ${error}`, interaction, undefined, false, false);
                    }
                }

                break;
            }

            case 5: { // modals
                const modal = modalInteractions.get(interaction.customId);
                if (!modal) return;

                try {
                    modal.execute(interaction);
                } catch (error) {
                    console.error(`❌  Failed to execute modal ${interaction.customId}: ${error}`);
                    await handleError(error as Error, `Failed to execute modal ${interaction.customId}`);

                    if (interaction.deferred) {
                        await reply(false, `Failed to execute modal ${interaction.commandName}: ${error}`, interaction, undefined, true, false);
                    } else {
                        await reply(false, `Failed to execute modal ${interaction.commandName}: ${error}`, interaction, undefined, false, false);
                    }
                }

                break;
            }

            default: {
                return;
            }
        }
    },
};

export default event;
