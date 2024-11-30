import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import { getPrimaryColour, reply } from '../../../utils/replyHelper';
import noblox, { PlayerInfo } from 'noblox.js';
import { validateRobloxUser } from '../../../utils/robloxHelper';
import data from '../../../data.json';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('pastusernames')
        .setDescription(`See a Roblox user's past usernames`)
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])

        .addStringOption(option =>
            option.setName('username')
                .setDescription(`Target to check`)
                .setRequired(true)),

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

        console.log(interaction);

        const target = interaction.options.getString('username');

        const timeNow = Math.round(new Date().getTime() / 1000);
        await reply(true, `Pending check on \`${target}\` (<t:${timeNow}:R>)`, interaction, undefined, true, false, true);

        let username: string | undefined;
        let userId: number | undefined;
        let playerInfo: PlayerInfo | undefined;

        try {
            ({ username, userId, playerInfo } = await validateRobloxUser(target as string));
        } catch (error) {
            await reply(false, error as string, interaction);

            return;
        }

        const userThumbnail = await noblox.getPlayerThumbnail(userId, '720x720', 'png', false, 'headshot');

        let pastUsernamesFinal;
        let mostRecentUsername;
        let robuxSpent;
        const pastUsernames = playerInfo.oldNames?.reverse();

        if (!pastUsernames || !pastUsernames.length) { 
            pastUsernamesFinal = `\`None\``;
            mostRecentUsername = `\`N/A\``;
            robuxSpent = `0`;
            pastUsernamesFinal = `\`None\``;
        } else {
            pastUsernamesFinal = `${String(pastUsernames)}`;
            pastUsernamesFinal = pastUsernamesFinal.replace(/,/g, `, `);
            mostRecentUsername = `\`${pastUsernames[0]}\``;
            robuxSpent = `\`${String((1000 * pastUsernames.length).toLocaleString())}\``;
            pastUsernamesFinal = `\n\`\`\`${pastUsernamesFinal}\n\`\`\``;
        } 

        const embed = new EmbedBuilder()
            .setColor(await getPrimaryColour())
            .setTitle(`${username}'s Past Usernames`)
            .setThumbnail(userThumbnail[0].imageUrl as string)
            .setURL(`https://www.roblox.com/users/${userId}/profile`)
            
            .setDescription(`${data.emojis.user} **Current Username:** \`${username}\` \n` +
                `${data.emojis.userSlash} **Most Recent Username:** ${mostRecentUsername} \n` +
                `${data.emojis.robuxGreen} **Total Spent on Usernames:** R$ ${robuxSpent} \n` +
                `${data.emojis.reason} **Past Usernames (Descending):** ${pastUsernamesFinal}`
            );

        await interaction.editReply({
            embeds: [embed]
        });
    }
};

export default command;