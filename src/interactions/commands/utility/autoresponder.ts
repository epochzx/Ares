import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, CommandInteraction, User, MessageComponentInteraction } from 'discord.js';
import { SlashCommand, AutoResponse } from '../../../types';
import { getPrimaryColour, pluralize, reply, splitIntoGroups } from '../../../utils/replyHelper';
import { createDocument, deleteDocument, getDocuments, getOneDocument } from '../../../services/dbService';
import { pagination, ButtonTypes, ButtonStyles } from '@devraelfreeze/discordjs-pagination';
import data from '../../../data.json';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('autorespond')
        .setDescription('See bot uptime and ping')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts([0])

        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription(`Create a new auto response prompt`)
                .addStringOption(option =>
                    option.setName('prompt')
                        .setDescription('What will trigger the auto response')
                        .setRequired(true))

                .addStringOption(option =>
                    option.setName('response')
                        .setDescription('What will be responded with')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription(`Delete an auto response prompt`)
                .addStringOption(option =>
                    option.setName('prompt')
                        .setDescription('What will trigger the auto response')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription(`List all current auto response prompts`)),

    execute: async (interaction: CommandInteraction) => {
        try {
            await interaction.deferReply();
        } catch {
            return;
        }

        if (!interaction.isChatInputCommand()) {
            return;
        }
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'add': {
                const prompt = interaction.options.getString('prompt');
                const response = interaction.options.getString('response');

                let data;

                try {
                    data = await getOneDocument<AutoResponse>(`autoResponses`, {prompt: prompt});
                } catch (error) {
                    reply(false, error as string, interaction);

                    return;
                }

                if (data != null) {
                    reply(false, `An auto response is already set up for this phrase.`, interaction);

                    return;
                }


                const doc = {
                    prompt: prompt,
                    response: response,
                };

                try {
                    await createDocument(`autoResponses`, doc);
                    reply(true, `Successfully created an auto response for "\`${prompt}\`"`, interaction);

                } catch (error) {
                    reply(false, error as string, interaction);

                    return;
                }

                break;
            }


            case 'list': {
                let databaseData;

                try {
                    databaseData = await getDocuments(`autoResponses`, {});
                } catch (error) {
                    reply(false, error as string, interaction);

                    return;
                }

                if (databaseData.length == 0) {
                    reply(false, `There are currently no autoresponder prompts.`, interaction);

                    return;
                }


                const promptSegments = [];
                for (const document of databaseData) {
                    const info = `${data.emojis.send} **Prompt:** \`${document.prompt}\` \n${data.emojis.reply} **Response:** \`${document.response}\` \n \n`;
                    promptSegments.push(info);
                }

                const groups = splitIntoGroups(promptSegments, 7);
                const promptEmbeds = [];

                for (const promptGroup of groups) {
                    const embed = new EmbedBuilder()
                        .setColor(await getPrimaryColour())
                        .setTitle(`Auto Response Prompts`)
                        .setFooter({text: pluralize(databaseData.length, `prompt`)})
                        .setDescription(promptGroup.join(''));

                    promptEmbeds.push(embed);
                }

                await pagination({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    embeds: promptEmbeds as Array<any>,
                    author: interaction.member?.user as User,
                    interaction: interaction,
                    ephemeral: false,
                    time: 600000,
                    disableButtons: true,
                    fastSkip: false,
                    pageTravel: false,

                    customFilter: (interaction: CommandInteraction | MessageComponentInteraction) => {
                        return interaction.member?.user.id === interaction.user.id;
                    },

                    buttons: [
                        {
                            type: ButtonTypes.previous,
                            emoji: data.emojis.chevronLeft,
                            style: ButtonStyles.Success,
                        },
                        {
                            type: ButtonTypes.next,
                            emoji: data.emojis.chevronRight,
                            style: ButtonStyles.Success
                        }
                    ]
                });

                break;
            }


            case 'delete': {
                const prompt = interaction.options.getString('prompt');

                let data;

                try {
                    data = await getOneDocument<AutoResponse>(`autoResponses`, {prompt: prompt});
                } catch (error) {
                    reply(false, error as string, interaction);

                    return;
                }

                if (data == null) {
                    reply(false, `There is no auto reply set up for "\`${prompt}\`" to delete.`, interaction);

                    return;
                }


                try {
                    await deleteDocument(`autoResponses`, {prompt: prompt});
                    reply(true, `Successfully deleted the auto responder prompt for "\`${prompt}\`"`, interaction);

                } catch (error) {
                    reply(false, error as string, interaction);

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