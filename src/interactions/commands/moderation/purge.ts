import { SlashCommandBuilder, TextChannel, PermissionFlagsBits, Message, User } from 'discord.js';
import { SlashCommand } from '../../../types';
import { pluralize, reply } from '../../../utils/replyHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a set amount of messages')

        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription(`Purge all messages, human and bot`)
                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(true))
                    
                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('match')
                .setDescription(`Purge all messages that match a certain phrase`)

                .addStringOption(option => 
                    option.setName('phrase')
                        .setDescription(`Phrase to match`)
                        .setRequired(true))

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))
                    
        .addSubcommand(subcommand =>
            subcommand
                .setName('bots')
                .setDescription(`Purge all messages from bots`)

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('humans')
                .setDescription(`Purge all messages from humans`)

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('embeds')
                .setDescription(`Purge all messages containing embeds`)

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('contains')
                .setDescription(`Purge all messages containg a certain phrase`)

                .addStringOption(option => 
                    option.setName('phrase')
                        .setDescription(`Phrase to match`)
                        .setRequired(true))

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription(`Purge all messages sent by a specific user`)

                .addUserOption(option => 
                    option.setName('user')
                        .setDescription(`User to purge messages of`)
                        .setRequired(true))

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('links')
                .setDescription(`Purge all messages containing links`)

                .addNumberOption(option => 
                    option.setName('amount')
                        .setDescription(`Amount of messages to purge`)
                        .setRequired(false))

                .addBooleanOption(option => 
                    option.setName('silent')
                        .setDescription(`Don't send a public success message`)
                        .setRequired(false)))

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts([0]),

    execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        function processFilteredMessages(filteredMessages: Map<string, Message>, messagesArray: Message[]): void {
            for (const filteredMessage of filteredMessages.values()) {
                messagesArray.push(filteredMessage);
            }
        }

        const subCommand = interaction.options.getSubcommand();
        let limit = interaction.options.getNumber('amount') ?? 100;

        const { channel } = interaction;
        if (!(channel instanceof TextChannel)) return;

        if (limit > 100) {
            await reply(false, `You cannot purge more than \`100\` messages.`, interaction);
            return;
        }

        const suffix = pluralize(limit, `message`);
        const messagesArray: Message[] = [];
        const messages = await channel.messages.fetch({ limit: limit });

        if (subCommand === 'all') {
            try {
                await channel.bulkDelete(messages);
                await reply(true, `Purged \`${limit}\` ${suffix}.`, interaction);
            } catch (error) {
                await reply(false, `Could not purge messages: ${error}`, interaction);
            }
            return;
        }

        let filteredMessages: Map<string, Message> = new Map();

        switch (subCommand) {
            case 'match': {
                const phrase = interaction.options.getString('phrase')?.toLowerCase();
                if (phrase) {
                    filteredMessages = messages.filter((message) => message.content.toLowerCase() === phrase);
                }
                break;
            }

            case 'bots':
                filteredMessages = messages.filter((message) => message.author.bot);
                break;

            case 'humans':
                filteredMessages = messages.filter((message) => !message.author.bot);
                break;

            case 'embeds':
                filteredMessages = messages.filter((message) => message.embeds.length > 0);
                break;

            case 'contains': {
                const phrase = interaction.options.getString('phrase')?.toLowerCase();
                if (phrase) {
                    filteredMessages = messages.filter((message) => message.content.toLowerCase().includes(phrase));
                }
                break;
            }

            case 'user': {
                const user = interaction.options.getUser('user') as User;
                filteredMessages = messages.filter((message) => message.author.id === user.id);
                break;
            }

            case 'links':
                filteredMessages = messages.filter((message) => message.content.startsWith('https://'));
                break;

            default:
                return;
        }

        processFilteredMessages(filteredMessages, messagesArray);

        if (messagesArray.length === 0) {
            await reply(false, `No messages to purge.`, interaction);
            return;
        }

        limit = messagesArray.length;
        const filteredSuffix = pluralize(limit, `message`);

        try {
            await channel.bulkDelete(messagesArray);
            await reply(true, `Purged \`${filteredSuffix}\`.`, interaction);
        } catch (error) {
            await reply(false, `Could not purge messages: ${error}`, interaction);
        }

        /*try {
            await logModerationAction(interaction.member?.user.id, interaction.member?.user.id, interaction.guild?.id, `Messages Purged`, `\`N/A\``, )
        } catch (error) {
            await reply(false, `An error occurred when trying to log this purge: ${error}. ${filteredSuffix} have still been successfully purged.`, interaction)
        }*/
    }
};

export default command;