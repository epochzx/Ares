/* eslint-disable @typescript-eslint/no-unused-vars */
import { SlashCommandBuilder, TextChannel, ThreadChannel, PermissionFlagsBits, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { SlashCommand } from '../../../types';
import { pluralize, reply } from '../../../utils/replyHelper';
import noblox, { PlayerInfo, PlayerThumbnailData } from 'noblox.js';
import { validateRobloxUser } from '../../../utils/robloxHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Roblox account background check')
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])

        .addStringOption(option =>
            option.setName('username')
                .setDescription(`Roblox account username`)
                .setRequired(true)),

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

        if (!interaction.isChatInputCommand()) {
            return;
        };

        const timeNow = Math.round(new Date().getTime() / 1000);
        
        // validate user to check
        const target = interaction.options.getString('username');

        let username: string | undefined;
        let userId: number | undefined;
        let playerInfo: PlayerInfo | undefined;

        try {
            ({ username, userId, playerInfo } = await validateRobloxUser(target as string));
        } catch (error) {
            await reply(false, error as string, interaction);

            return;
        }

        if (interaction.member?.user.id != '366013757702275073') {
            await reply(true, `This command is not completed yet`, interaction, undefined, true, false, true);

            return;
        }

        await reply(true, `Pending check on \`${username}\` (<t:${timeNow}:R>)`, interaction, undefined, true, false, true);

        // user to check is valid
        // get user info

        // placeholders
        const alertPrefix = '-';
        const suspicionPrefix = '#';

        const alerts = '```diff\n';
        const suspicions = '';
        const amendments = '```diff\n';
        const chronicle = 0;

        const altRating = '';
        const recommendation = '';

        const sandhurstAlerts = '```diff\n';
        const sandhurstSuspicions = '';

        const badgeGetAmount = 250;
        const inventoryItemsGetAmount = 30;
        let privateInventory = false;

        const userBadges = await noblox.getPlayerBadges(userId, 250);
        const userGroups = await noblox.getGroups(userId);

        let userThumbnail: PlayerThumbnailData | null = null;
        await noblox.getPlayerThumbnail(userId, '720x720', 'png', false, 'headshot').then((thumbnail) => {
            const matchesTarget = thumbnail.filter(f => f.targetId == userId);
            userThumbnail = matchesTarget.length > 0 ? matchesTarget[0] : null;
        });

        const userClothing = await noblox.getInventory(userId, ['Shirt', 'Pants', 'TShirt'], 'Asc', 30).catch(() => {
            privateInventory = true;
        });

        const userAccessories = await noblox.getInventory(userId, ['Hat', 'FaceAccessory', 'WaistAccessory', 'BackAccessory', 'FrontAccessory', 'ShoulderAccessory', 'NeckAccessory'], 'Asc', 30).catch(() => {
            privateInventory = true;
        });

        if (userClothing == null || userAccessories == null) {
            privateInventory = true;
        }

        const accountCreatedTimestamp = new Date(playerInfo.joinDate);

        const accountCreatedYears = ((playerInfo.age || 0) / 365).toFixed(1);
        const accountCreatedMonths = (parseInt(accountCreatedYears) * 12).toFixed(1);
        const accountCreatedDays = playerInfo.age || 0;
        const accountCreatedSeconds = Math.floor(accountCreatedTimestamp.getTime() / 1000);

        let humanReadableAccountAge;
        if (accountCreatedDays <= 30) {
            humanReadableAccountAge = `${accountCreatedDays} days`;
        } else if (accountCreatedDays <= 365) {
            humanReadableAccountAge = `${accountCreatedMonths} months`;
        } else {
            humanReadableAccountAge = `${accountCreatedYears} years`;
        }

        let pastUsernamesAmount = 0;
        let pastUsernames = String(playerInfo.oldNames);

        if (!pastUsernames) {
            pastUsernames = 'None';
        } else {
            pastUsernames = `\`${pastUsernames.replace(/,(?=[^\s])/g, ', ')}\``;

            const pastNamesArray = pastUsernames.split(',');
            pastUsernamesAmount = pastNamesArray.length;

            if (pastUsernamesAmount >= 10) {
                const mostRecentNames = pastNamesArray.reverse();
                const lastTenNames = mostRecentNames.slice(0, 10);

                pastUsernames = `\`${lastTenNames.toString()}\`  **...  +${pastNamesArray.length - 10}**`;
            }
        }

        const totalRobuxSpentOnUsernames = 1000 * (pastUsernamesAmount || 0);
    }
};

export default command;