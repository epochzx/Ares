import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { handleError } from "../../../utils/errorHandler";

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure automod rules')
        .setContexts([0])

        .addSubcommand(subcommand =>
            subcommand
                .setName('blacklist')
                .setDescription(`Blacklist a word or phrase`)

                .addStringOption(option =>
                    option.setName('content')
                        .setDescription(`Word or phrase to blacklist`)
                        .setRequired(true)))

        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async (interaction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }

        if (!interaction.isChatInputCommand()) { return; }

        const guild = interaction.guild;
        const subCommand = interaction.options.getSubcommand();

        if (!guild) { return; }

        switch (subCommand) {
            case 'blacklist': {
                //const toBlacklist = interaction.options.getString('content');

                try {
                    /*const automodRule = guild.autoModerationRules.cache
                    console.log(automodRule)*/

                    /*await guild.autoModerationRules.create({
                        name: `Blacklist ${toBlacklist}`,
                        enabled: true,
                        eventType: AutoModerationRuleEventType.MessageSend,
                        triggerType: AutoModerationRuleTriggerType.Keyword,
                        triggerMetadata: {
                            keywordFilter: [`${toBlacklist}`]
                        },
                        actions: [
                            {
                                type: AutoModerationActionType.BlockMessage,
                                metadata: {
                                    customMessage: 'Test',
                                    durationSeconds: 1,
                                }
                            }
                        ]
                    })

                    await reply(true, `Successfully created an automod trigger for the content \`${toBlacklist}\`.`, interaction);*/
                } catch (error) {
                    await reply(false, `Failed to create automod trigger: \`${error}\``, interaction);
                    await handleError(error as Error, `Failed to create automod trigger`);

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