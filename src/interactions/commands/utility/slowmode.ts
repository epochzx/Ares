import { SlashCommandBuilder, TextChannel, ThreadChannel, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../../types';
import { pluralize, reply } from '../../../utils/replyHelper';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Manage the slowmode of a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setContexts([0])

        .addNumberOption(option =>
            option.setName('seconds')
                .setDescription(`Seconds for slowmode`)
                .setRequired(true))
        
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription(`Leave blank to apply to current channel`)
                .setRequired(false)),

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

        const channel = interaction.options.getChannel('channel') as TextChannel | ThreadChannel ?? interaction.channel;
        const seconds = interaction.options.getNumber('seconds');
        if (seconds == null) { return; }
        
        if (seconds > 21600) {
            await reply(false, `Slowmode cannot be longer than \`6 hours\`.`, interaction);

            return;
        }

        if (seconds < 0) {
            await reply(false, `Slowmode cannot be negative.`, interaction);

            return;
        }
        
        try {
            await channel.setRateLimitPerUser(seconds);

            if (seconds == 0) {
                await reply(true, `Slowmode in <#${channel.id}> has been removed.`, interaction);
            } else {
                await reply(true, `Slowmode in <#${channel.id}> is now \`${pluralize(seconds, `second`)}\`.`, interaction);
            }
        } catch (error) {
            await reply(false, `Failed to set channel slowmode: ${error}`, interaction);

            return;
        }
    }
};

export default command;