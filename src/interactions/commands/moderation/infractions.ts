import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ColorResolvable, User, CommandInteraction, ButtonInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { SlashCommand, Infraction } from '../../../types';
import { getPrimaryColour, pluralize, reply, splitIntoGroups } from '../../../utils/replyHelper';
import { infractionToString } from '../../../utils/moderationHelper';
import data from '../../../data.json';
import { createAudit } from '../../../services/moderationService';
import { logModerationAction } from '../../../services/loggingService';
import { deleteDocument, getDocuments, getOneDocument } from '../../../services/dbService';
import { pagination, ButtonTypes, ButtonStyles } from '@devraelfreeze/discordjs-pagination';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('Manage the moderation history of a user')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription(`View a users moderation history`)
                .addUserOption(option => 
                    option.setName('target')
                        .setDescription(`User to view moderation history of`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('id')
                .setDescription(`View a specific moderation action`)
                .addNumberOption(option => 
                    option.setName('id')
                        .setDescription(`Infraction ID to lookup`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription(`Delete a user's infraction`)

                .addNumberOption(option => 
                    option.setName('id')
                        .setDescription('Infraction ID to delete')
                        .setRequired(true))
                    
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('Reason for deleting infraction')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription(`Delete all of a user's infractions`)

                .addUserOption(option => 
                    option.setName('target')
                        .setDescription('User to clear infractions')
                        .setRequired(true))
                    
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('Reason for clearing infractions')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription(`View all currently active infractions`))

        .addSubcommand(subcommand =>
            subcommand
                .setName('audit')
                .setDescription(`View an audit log of all moderation actions within the server`)

                .addStringOption(option => 
                    option.setName('action')
                        .setDescription('Filter by action')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Ban', value: 'Ban' },
                            { name: 'Unban', value: 'Unban' },
                            { name: 'Kick', value: 'Kick' },
                            { name: 'Mute', value: 'Mute' },
                            { name: 'Unmute', value: 'Unmute' },
                            { name: 'Warn', value: 'Warn' },
                            { name: 'Infraction Removed', value: 'Infraction Removed' },
                            { name: 'Infractions Cleared', value: 'Infractions Cleared' },
                        ))
                    
                .addUserOption(option => 
                    option.setName('moderator')
                        .setDescription('Filter by moderator')
                        .setRequired(false)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription(`Edit the details of an infraction`)

                .addNumberOption(option => 
                    option.setName('id')
                        .setDescription('Infraction ID to edit')
                        .setRequired(true))
                    
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('New reason')
                        .setRequired(false))
                    
                .addStringOption(option => 
                    option.setName('evidence')
                        .setDescription('New evidence')
                        .setRequired(false)))

        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setContexts([0]),

    execute: async (interaction: CommandInteraction) => {
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

        const targetOption = interaction.options.getUser('target');

        const guild = interaction.guild;
        if (!guild) { return; }

        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'view': {
                if (!targetOption) { return; }

                const infractions = await getDocuments(`infractions`, { userId: targetOption.id, guildId: guild.id }, { sort: { time: -1 } });

                if (infractions.length == 0) {
                    await reply(true, `<@${targetOption.id}> has no infractions.`, interaction);

                    return;
                }

                const infractionInformation: string[] = [];
                for (const infraction of infractions) {
                    let baseInfo = await infractionToString(infraction);
                    
                    baseInfo += '\n';
                    infractionInformation.push(baseInfo);
                }

                const groups = splitIntoGroups(infractionInformation, 3);
                const infractionEmbeds: EmbedBuilder[] = [];

                for (const infractionGroup of groups) {
                    const embed = new EmbedBuilder()
                        .setColor(await getPrimaryColour())
                        .setTitle(`${targetOption.username}'s Infractions`)
                        .setAuthor({ name: `${targetOption.username} (${targetOption.id})`, iconURL: `https://cdn.discordapp.com/avatars/${targetOption.id}/${targetOption.avatar}.png?size=256`})
                        .setFooter({ text: pluralize(infractions.length, `infraction`) })
                        .setDescription(infractionGroup.join(''));

                    infractionEmbeds.push(embed);
                }
                
                await pagination({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    embeds: infractionEmbeds as Array<any>,
                    author: interaction.member?.user as User,
                    interaction: interaction,
                    ephemeral: false,
                    time: 600000,
                    disableButtons: true,
                    fastSkip: true,
                    pageTravel: false,

                    customFilter: (paginationInteraction: ButtonInteraction) => {
                        return paginationInteraction.member?.user.id == interaction.member?.user.id;
                    },

                    buttons: [
                        {
                            type: ButtonTypes.previous,
                            emoji: data.emojis.chevronLeft,
                            style: ButtonStyles.Danger,
                        },
                        {
                            type: ButtonTypes.next,
                            emoji: data.emojis.chevronRight,
                            style: ButtonStyles.Danger
                        },
                        {
                            type: ButtonTypes.last,
                            emoji: data.emojis.doubleChevronRight,
                            style: ButtonStyles.Danger
                        },
                        {
                            type: ButtonTypes.first,
                            emoji: data.emojis.doubleChevronLeft,
                            style: ButtonStyles.Danger
                        },
                    ]
                });

                break;
            }

            case 'all': {
                const infractions = await getDocuments(`infractions`, { guildId: guild.id }, { sort: { time: -1 } });

                if (infractions.length == 0) {
                    await reply(true, `There are no active infractions.`, interaction);

                    return;
                }

                const infractionInformation: string[] = [];
                for (const infraction of infractions) {
                    let baseInfo = await infractionToString(infraction);
                    
                    baseInfo += '\n';
                    infractionInformation.push(baseInfo);
                }

                const groups = splitIntoGroups(infractionInformation, 3);
                const infractionEmbeds: EmbedBuilder[] = [];

                for (const infractionGroup of groups) {
                    const embed = new EmbedBuilder()
                        .setColor(await getPrimaryColour())
                        .setTitle(`All ${guild.name} Infractions`)
                        .setAuthor({ name: guild.name, iconURL: guild.iconURL() as string})
                        .setFooter({ text: pluralize(infractions.length, `total infraction`) })
                        .setDescription(infractionGroup.join(''));

                    infractionEmbeds.push(embed);
                }

                await pagination({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    embeds: infractionEmbeds as Array<any>,
                    author: interaction.member?.user as User,
                    interaction: interaction,
                    ephemeral: false,
                    time: 600000,
                    disableButtons: true,
                    fastSkip: true,
                    pageTravel: false,

                    customFilter: (paginationInteraction: ButtonInteraction) => {
                        return paginationInteraction.member?.user.id == interaction.member?.user.id;
                    },

                    buttons: [
                        {
                            type: ButtonTypes.previous,
                            emoji: data.emojis.chevronLeft,
                            style: ButtonStyles.Danger,
                        },
                        {
                            type: ButtonTypes.next,
                            emoji: data.emojis.chevronRight,
                            style: ButtonStyles.Danger
                        },
                        {
                            type: ButtonTypes.last,
                            emoji: data.emojis.doubleChevronRight,
                            style: ButtonStyles.Danger
                        },
                        {
                            type: ButtonTypes.first,
                            emoji: data.emojis.doubleChevronLeft,
                            style: ButtonStyles.Danger
                        },
                    ]
                });

                break;
            }

            case 'id': {
                const idOption = interaction.options.getNumber('id');
                const infraction = await getOneDocument<Infraction>(`infractions`, { time: idOption, guildId: guild.id });

                if (!infraction) {
                    await reply(false, `This infraction does not exist.`, interaction);

                    return;
                }

                const baseInfo = await infractionToString(infraction);

                const infractionEmbed = new EmbedBuilder()
                    .setColor(await getPrimaryColour()) 
                    .setTitle(`Infraction ${interaction.options.getNumber('id')}`)
                    .setDescription(baseInfo);

                const deleteButton = new ButtonBuilder()  
                    .setLabel('Delete Infraction')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(data.emojis.delete)
                    .setCustomId('deleteInfraction');

                const actionRow = new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(deleteButton);

                await interaction.editReply({
                    embeds: [infractionEmbed], 
                    components: [actionRow],
                });

                break;
            }

            case 'delete': {
                const idOption = interaction.options.getNumber('id');
                const reasonOption = interaction.options.getString('reason');
                const infraction = await getOneDocument<Infraction>(`infractions`, { time: idOption, guildId: guild.id });

                if (!infraction) {
                    await reply(false, `This infraction does not exist.`, interaction);

                    return;
                }

                if (infraction.active) {
                    await reply(false, `You cannot delete the infraction of an active ban. Unban this user first.`, interaction);

                    return;
                }

                const baseInfo = await infractionToString(infraction);

                const infractionEmbed = new EmbedBuilder()
                    .setColor(await getPrimaryColour())
                    .setTitle(`Infraction ${interaction.options.getNumber('id')}`)
                    .setDescription(baseInfo);

                const target = interaction.guild.members.cache.get(infraction.userId);
                if (target) {
                    try {
                        await target.send({
                            embeds: [infractionEmbed.setColor(data.colours.success as ColorResolvable).setTitle('Your infraction was removed')]
                        });
                    } catch (error) {
                        console.log(`Failed to DM infraction removed embed to user: ${error}`);
                    }
                }

                try {
                    await deleteDocument(`infractions`, { time: idOption, guildId: guild.id });
                    await reply(true, `Successfully deleted infraction \`${idOption}\``, interaction);
                } catch (error) {
                    await reply(false, `Failed to delete infraction \`${idOption}\`: ${error}`, interaction);
                }

                try {
                    await createAudit(infraction.userId as string, interaction.member?.user.id as string, guild.id, `Infraction Removed`, reasonOption as string, Math.floor(Date.now() / 1000), `\`N/A\``);
                    await logModerationAction(infraction.userId as string, interaction.member?.user.id as string, guild.id, `Infraction Removed`, reasonOption as string, Math.floor(Date.now() / 1000), `green`, null, null, baseInfo);
                } catch (error) {
                    await reply(false, `An error occurred when trying to log this action: ${error}. <@${target?.id}>'s infraction has still been successfully deleted.`, interaction);
                }

                break;
            }

            case 'clear': {
                const reasonOption = interaction.options.getString('reason');
                if (!targetOption) { return; }

                const infractions = await getDocuments(`infractions`, { userId: targetOption.id, guildId: guild.id }, { sort: { time: -1 } });

                if (infractions.length == 0) {
                    await reply(true, `<@${targetOption.id}> has no infractions.`, interaction);

                    return;
                }

                const target = interaction.guild.members.cache.get(targetOption.id);

                try {
                    for (const infraction of infractions) {
                        await deleteDocument(`infractions`, { time: infraction.time });
                    }
                    await reply(true, `Successfully cleared infractions for <@${targetOption.id}>`, interaction);
                } catch (error) {
                    await reply(false, `Failed to clear infractions for <@${targetOption.id}>: ${error}`, interaction);
                }

                let resultEmbed: EmbedBuilder | undefined;

                try {
                    await createAudit(targetOption.id as string, interaction.member?.user.id as string, guild.id, `Infractions Cleared`, reasonOption as string, Math.floor(Date.now() / 1000), `\`N/A\``);
                    resultEmbed = await logModerationAction(targetOption.id as string, interaction.member?.user.id as string, guild.id, `Infractions Cleared`, reasonOption as string, Math.floor(Date.now() / 1000), `green`, null, null, `${data.emojis.hashtag} **Infractions Cleared:** \`${infractions.length}\``);
                } catch (error) {
                    await reply(false, `An error occurred when trying to log this action: ${error}. <@${targetOption?.id}>'s infractions have still been successfully cleared.`, interaction);
                }

                if (resultEmbed != undefined) {
                    if (target) {
                        try {
                            await target.send({
                                embeds: [resultEmbed.setColor(data.colours.success as ColorResolvable).setTitle('Your infractions were cleared')]
                            });
                        } catch (error) {
                            console.log(`Failed to DM infractions cleared embed to user: ${error}`);
                        }
                    }
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