import { CronJob } from 'cron';
import { CronSchedule } from '../types';
import { getRobloxStatus, checkRobloxStatus, updateStatusEmbed } from '../services/robloxStatusService';

let lastStatus: string | null = null;

const cronJob: CronSchedule = {
    schedule: '*/10 * * * *',
    environment: 'DEV',

    execute: async function() {
        const job = new CronJob(this.schedule, async () => {
            try {
                const currentStatus = await getRobloxStatus();

                if (currentStatus[1] !== lastStatus) {
                    await checkRobloxStatus();
                    lastStatus = currentStatus[1];
                } else {
                    await updateStatusEmbed(currentStatus[1] == 'Operational' ? true : false, 
                        currentStatus[1], 
                        Math.floor((new Date(currentStatus[0]).getTime()) / 1000), 
                        Math.floor((new Date().getTime()) / 1000));
                }
            } catch {
                return;;
            }
        });

        job.start();
    }
};

export default cronJob;