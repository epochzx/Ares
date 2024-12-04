import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';
import data from '../.././../data.json';

export const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage server roles')
        .setContexts([0])

        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription(`Get information on a specific role`)

                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription(`Role to lookup`)
                        .setRequired(true))),

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
        }

        function permissionsNames(permissions: PermissionsBitField) {
            const result = [];
        
            for (const perm of Object.keys(PermissionsBitField.Flags) as Array<keyof typeof PermissionsBitField.Flags>) {
                if (permissions.has(PermissionsBitField.Flags[perm])) {
                    result.push(perm);
                }
            }
        
            return result;
        }

        const targetRole = interaction.options.getRole('role');
        const subCommand = interaction.options.getSubcommand();

        if (!targetRole) {
            return;
        }

        switch (subCommand) {
            case 'info': {
                await interaction.guild?.members.fetch();
                const role = interaction.guild?.roles.cache.get(targetRole.id);

                if (!role) {
                    return;
                }

                const rawRoleMembers = role.members.map(m => m.user.id);
                const rawFirst35Members = rawRoleMembers.slice(0, 35);

                let first35RoleMembers = rawRoleMembers.slice(0, 35).map(number => `<@${number}>`).join(' ');

                if (first35RoleMembers.length == 0) {
                    first35RoleMembers = 'Nobody';
                }


                const membersNotShown = rawRoleMembers.length - rawFirst35Members.length;
                if (membersNotShown >= 1) {
                    first35RoleMembers += ` **+ ${membersNotShown}**`;
                }


                let rolePermissions = permissionsNames(role.permissions);
                rolePermissions = rolePermissions.map(item => item.replace(/([a-z])([A-Z])/g, '$1 $2'));

                const removeList = ['Create Instant Invite', 'Add Reactions', 'Priority Speaker', 'View Audit Log', 'Stream', 'View Channel', 'Send Messages', 'Send TTSMessages',
                    'Read Message History', 'View Guild Insights', 'Connect', 'Speak', 'Use VAD', 'Manage Guild Expressions', 'Request To Speak',
                    'Use Embedded Activites', 'View Creator Monetization Analytics', 'Create Guild Expressions'
                ];

                rolePermissions = rolePermissions.filter(item => !removeList.includes(item));

                if (rolePermissions.length == 0) {
                    rolePermissions = ['None'];
                }


                const rolePermissionsString = rolePermissions.join(', ');

                const embed = new EmbedBuilder()
                    .setTitle(`${role.name} Role Information`)
                    .setColor(role.color)
                    .addFields(
                        {
                            name: 'Information', value: `${data.emojis.id} **ID:** \`${role.id}\` \n` +
                                `${data.emojis.userGroup} **Members:** \`${rawRoleMembers.length}\` \n` +
                                `${data.emojis.colour} **Colour:** \`#${role.color}\` \n` +
                                `${data.emojis.position} **Position:** \`${role.rawPosition}\` \n` +
                                `${data.emojis.ping} **Mentionable:** \`${role.mentionable}\` \n` +
                                `${data.emojis.hoisted} **Hoisted:** \`${role.hoist}\` \n` +
                                `${data.emojis.adminUser} **Key Permissions:** \`${rolePermissionsString}\``
                        },
                        {name: `Members (${rawRoleMembers.length})`, value: first35RoleMembers}
                    );

                await interaction.editReply({
                    embeds: [embed]
                });

                break;
            }


            default: {
                return;
            }

        }
    }
};

export default command;