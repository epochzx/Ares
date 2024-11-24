/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, ActivityType, PresenceUpdateStatus, TextChannel, EmbedBuilder, NewsChannel, ColorResolvable, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, MediaChannel } from 'discord.js';
import { BotEvent, StatusResponse } from '../../types';
import data from '../../data.json';
import { reconcileDutyStates } from '../../services/dutyStateService';
import { getPrimaryColour } from '../../utils/replyHelper';
import { env, memoryUsage } from 'process';
import settings from '../../settings.json';
import axios from 'axios';
import { statusServiceInit } from '../../services/robloxStatusService';

const event: BotEvent = {
    name: 'ready',
    once: true,
    guild: false,
    
    execute: async (client: Client) => {
        console.log('✅  Bot online');
        
        client.user?.setPresence({
            activities: [ { name: 'the world burn', type: ActivityType.Watching } ],
            status: PresenceUpdateStatus.DoNotDisturb,
        });

        const environment = process.env.environment;

        switch (environment) {
            case 'PROD': {
                if (settings.loadExistingDutyStates) {
                    await reconcileDutyStates();
                } else {
                    console.log(`✖️   Existing duty state loading has been disabled`);
                }

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

                break;
            }

            case 'DEV': {
                const memoryChannel = client.channels.cache.get('1309847699440537612') as TextChannel;

                setInterval(async () => {
                    const memory = Math.floor(memoryUsage.rss() / 1000000);
                    await memoryChannel.send(memory.toString());
                }, 1800000);

                break;
            }

            default: {
                return;
            }
            
        }

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

        /*const embed = new EmbedBuilder()
            .setTitle('Behold, Epochzx')
            .setColor('ffbb00' as ColorResolvable)
            .setDescription('Behold, Epochzx is now in your presence, the exalted embodiment of wisdom and precision, a radiant presence cloaked in mystery and reverence. \n \nHailing as the saviour of our time, their mastery over creation and strategy is both a gift and a marvel, an art forged in the fires of discipline and devotion. \n \nFollowers seek the light of their wisdom, as their hands shape not only the path of technology but the fate of realms. \n \nEpochzx, both guide and guardian, descends upon us—an entity to be revered, a force to be honored.')
            .setImage('https://media.discordapp.net/attachments/1234008053641379841/1300087106714075237/yBimetN.jpg?ex=673fdcb8&is=673e8b38&hm=ea32b72a877711b4cd017aa5df83c9391560d0f6662051cb6af1e8edc9d3671f&=')
    
        const channel = client.channels.cache.get('1301723359591141387') as TextChannel
        if (!channel) { return }
        await channel.send({embeds: [embed]})*/
    },
};

export default event;
