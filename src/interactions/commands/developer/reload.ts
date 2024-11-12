import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../../types';
import { pluralize, reply } from '../../../utils/replyHelper';
import { reloadComponentInteractions, reloadModalInteractions } from '../../../utils/reloadHandler';

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload app systems')
        .setContexts([0,1,2])
        .setIntegrationTypes([0,1])

        .addSubcommand(subcommand =>
            subcommand
                .setName('components')
                .setDescription(`Reload components`))

        .addSubcommand(subcommand =>
            subcommand
                .setName('modals')
                .setDescription(`Reload modals`))

        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async (interaction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const subCommand = interaction.options.getSubcommand();

        switch(subCommand) {
            case `components`: {
                try {
                    const result = await reloadComponentInteractions();

                    if (result == false) {
                        await reply(false, `There are no components to reload.`, interaction);
                    } else {
                        await reply(true, `Successfully reloaded \`${pluralize(result as number, `component`)}\``, interaction);
                    }
                    
                } catch (error) {
                    await reply(false, `Failed to reload components: \`${error}\``, interaction);

                    return;
                }

                break;
            }

            case `modals`: {
                try {
                    const result = await reloadModalInteractions();

                    if (result == false) {
                        await reply(false, `There are no modals to reload.`, interaction);
                    } else {
                        await reply(true, `Successfully reloaded \`${pluralize(result as number, `modal`)}\``, interaction);
                    }
                    
                } catch (error) {
                    await reply(false, `Failed to reload modals: \`${error}\``, interaction);

                    return;
                }

                break;
            }

            default: {
                return;
            }
        }
    }
};

export default command;