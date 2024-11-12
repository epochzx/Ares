/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, ActivityType, PresenceUpdateStatus, TextChannel, EmbedBuilder, NewsChannel, ColorResolvable, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, MediaChannel } from 'discord.js';
import { BotEvent } from '../../types';
import data from '../../data.json';
import { reconcileDutyStates } from '../../services/dutyStateService';
import { getPrimaryColour } from '../../utils/replyHelper';
import { memoryUsage } from 'process';

const event: BotEvent = {
    name: 'ready',
    once: true,

    execute: async (client: Client) => {
        console.log('✅  Bot online');
        console.log('✅  Latest version');

        client.user?.setPresence({
            activities: [{name: 'the world burn', type: ActivityType.Watching}],
            status: PresenceUpdateStatus.DoNotDisturb,
        });

        if (process.env.environment && process.env.environment == 'PROD') {
            await reconcileDutyStates();

            const processLogs = client.channels.cache.get(data.channels.processLogging) as NewsChannel | TextChannel;

            const restartedEmbed = new EmbedBuilder()
                .setColor(await getPrimaryColour())
                .setTitle('Process Restarted')
                .setAuthor({
                    name: client.user?.username as string,
                    iconURL: `https://cdn.discordapp.com/avatars/${client.user?.id}/${client.user?.avatar}.png?size=256`
                });

            const restartedMessage = await processLogs.send({ embeds: [restartedEmbed] });
            await restartedMessage.crosspost();
        }

        //const result = await fetch('http://hostedstatus.com/1.0/status/59db90dbcdeb2f04dadcf16d')
        
       // const channel = client.channels.cache.get('1301723359591141387') as TextChannel;
        //const message = await channel.messages.fetch('1301736270955024465')

       /* const button = new ButtonBuilder()  
            .setLabel('15 minutes')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('unixTimecode15Minutes')

        const button2 = new ButtonBuilder()  
            .setLabel('20 minutes')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('unixTimecode20Minutes')

        const button3 = new ButtonBuilder()  
            .setLabel('30 minutes')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('unixTimecode30Minutes')

        const button4 = new ButtonBuilder()  
            .setLabel('45 minutes')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('unixTimecode45Minutes')

        const button5 = new ButtonBuilder()  
            .setLabel('50 minutes')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('unixTimecode50Minutes')*/

        /*const embed = new EmbedBuilder()
            .setTitle('Duty States')
            .setColor(await getPrimaryColour())
            .setDescription('Interact with the prompt attached to this post in order to start your duty.')
            .setThumbnail('https://tr.rbxcdn.com/6edaf88a1f55bc6928dc4c96c8900e64/150/150/Image/Webp');*/

        /*const embed = new EmbedBuilder()
            .setTitle('Timezone Selection')
            .setColor(await getPrimaryColour())
            .setDescription('Interact with the prompt attached to this post in order to set the timezone to be used in your duty states. This saves and you only have to do it once. \n \nIf you do not set your timezone, your duty states will default to GMT time.');$*/

       /*const button = new ButtonBuilder()  
            .setLabel('Begin Duty State')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('startDutyState')
            .setEmoji(data.emojis.play);*/

        //const actionRow = new ActionRowBuilder<ButtonBuilder>()
        //    .setComponents(button, button2, button3, button4, button5);

        /*const timezoneSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('timezoneSelect')
            .setPlaceholder('Select your timezone (GMT Offset)')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('GMT+0').setValue('GMT+0'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+1').setValue('GMT+1'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+2').setValue('GMT+2'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+3').setValue('GMT+3'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+4').setValue('GMT+4'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+5').setValue('GMT+5'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+6').setValue('GMT+6'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+7').setValue('GMT+7'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+8').setValue('GMT+8'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+9').setValue('GMT+9'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+10').setValue('GMT+10'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+11').setValue('GMT+11'),
                new StringSelectMenuOptionBuilder().setLabel('GMT+12').setValue('GMT+12'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-1').setValue('GMT-1'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-2').setValue('GMT-2'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-3').setValue('GMT-3'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-4').setValue('GMT-4'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-5').setValue('GMT-5'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-6').setValue('GMT-6'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-7').setValue('GMT-7'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-8').setValue('GMT-8'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-9').setValue('GMT-9'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-10').setValue('GMT-10'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-11').setValue('GMT-11'),
                new StringSelectMenuOptionBuilder().setLabel('GMT-12').setValue('GMT-12')
            );

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(timezoneSelectMenu);*/
            
        /*await channel.send({
            //embeds: [embed], 
            components: [actionRow]
        });*/
    },
};

export default event;
