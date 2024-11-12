import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, CommandInteraction, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../../../types';
import { reply } from '../../../utils/replyHelper';
import data from '../../../data.json';

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('ADMIN')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code to evaluate')
                .setRequired(true))

        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async (interaction: CommandInteraction) => {
        try {
            await interaction.deferReply({
                ephemeral: false
            });
        } catch {
            return;
        }

        if (interaction.member) {
            if (interaction.member?.user.id != '366013757702275073') {
                reply(false, `You are not authorised to use this command`, interaction);
    
                return;
            }
        }

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const code = interaction.options.getString('code');

        const clean = async (text: string) => {
            if (typeof text !== 'string') {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                text = require('util').inspect(text, {depth: 1});
            }

            text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));

            return text;
        };

        let output;
        let colour;

        if (!code) {
            return;
        }

        try {
            output = await clean(eval(code));
            colour = data.colours.success;
        } catch (error) {
            output = error;
            colour = data.colours.error;
        }

        const embed = new EmbedBuilder()
            .setColor(colour as ColorResolvable)
            .addFields(
                {name: 'Input', value: `\`\`\`js\n${code}\n\`\`\``},
                {name: 'Output', value: `\`\`\`js\n${output}\n\`\`\``},
            );

        await interaction.editReply({
            embeds: [embed]
        });
    }
};

export default command;