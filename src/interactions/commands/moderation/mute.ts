import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildMember, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import { getDuration, verifyTarget } from '../../../utils/moderationHelper';
import data from '../../../data.json';
import { createInfraction } from '../../../services/moderationService';
import { logModerationAction } from '../../../services/loggingService';
import { formatTimeUntil } from '../../../utils/miscHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Member to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration of ban'))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for ban'))
        .addStringOption(option => 
            option.setName('evidence')
                .setDescription('Evidence for reason of ban'))

        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .setContexts([0]),

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

        const targetOption = interaction.options.getUser('target');
        if (!targetOption) { return; }

        const target = interaction.guild?.members.cache.get(targetOption.id);
        
        const validTarget = await verifyTarget(target as GuildMember, interaction);
        if (!validTarget) { return; }

        if (target?.communicationDisabledUntil != null) {
            await reply(false, `<@${target.id}> is already muted.`, interaction);

            return;
        }

        const duration = interaction.options.getString('duration');
        let validDuration: number | boolean;

        if (duration == null) {
            validDuration = 2419200000;
        } else {
            validDuration = await getDuration(duration as string);

            if (!validDuration) {
                await reply(false, `A proper duration was not given. \nAcceptable parameters: \`(s)econds\`, \`(h)ours\`, \`(d)ays\`, \`(m)onths\`, \`(y)ears\` \nExample usage: \`60s\`, \`3d\`, etc.`, interaction);
            
                return;
            }

            if (validDuration as number > 2419200000) {
                await reply(false, `You cannot mute somebody for longer than \`28\` days.`, interaction);
            
                return;
            }
        }

        const reason = interaction.options.getString('reason') || 'No reason specified';
        let evidence = interaction.options.getString('evidence');

        if (!evidence) {
            evidence = '`None`';
        } else if (!evidence.includes('https://')) {
            await reply(false, `Evidence must be a media URL.`, interaction);

            return;
        }
        
        const infractionId = Math.floor(new Date().getTime() / 1000);

        const guild = interaction.guild;
        if (!guild) { return; }

        const unmuteTimeMilliseconds = Date.now() + (validDuration as number);
        const unmuteTimeUnixTimecode = `<t:${Math.floor(unmuteTimeMilliseconds / 1000)}:f>`;
        const unmuteTimeHumanFormat = formatTimeUntil(unmuteTimeMilliseconds, Date.now());

        if (target) {
            const userEmbed = new EmbedBuilder()
                .setTitle(`You were muted in ${interaction.guild?.name}`)
                .setColor(data.colours.error as ColorResolvable)
                .setDescription(`
                    ${data.emojis.message} **Reason:** \`${reason}\` \n` +
                    `${data.emojis.adminUser} **Moderator:** <@${interaction.member?.user.id}> (\`${interaction.member?.user.id}\`) \n` +
                    `${data.emojis.time} **Duration:** \`${unmuteTimeHumanFormat}\` \n` +
                    `${data.emojis.timer} **Ends:** ${unmuteTimeUnixTimecode} \n` +
                    `${data.emojis.picture} **Evidence:** ${evidence}`)
                .setAuthor({
                    iconURL: interaction.guild.iconURL() as string, 
                    name: interaction.guild.name
                });

            try {
                await target.send({embeds: [userEmbed]});
            } catch {
                console.log(`Could not DM mute message to ${target.id}`);
            }
        }

        try {
            await target?.timeout(validDuration as number);
            await reply(true, `Successfully muted <@${target?.id}> for \`${unmuteTimeHumanFormat}\``, interaction);
        } catch (error) {
            await reply(false, `Failed to mute <@${target?.id}>: ${error}`, interaction);

            return;
        }

        try {
            await createInfraction(target?.id as string, interaction.member?.user.id as string, guild.id, `Mute`, reason, infractionId, evidence, unmuteTimeMilliseconds);
            await logModerationAction(target?.id as string, interaction.member?.user.id as string, guild.id, `Mute`, reason, infractionId, `red`, evidence, unmuteTimeHumanFormat);
        } catch (error) {
            await reply(false, `An error occurred when trying to log this mute: ${error}. <@${target?.id}> has still been successfully muted.`, interaction);
        }
    }   
};

export default command;