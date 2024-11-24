import { CronJob } from 'cron';
import { CronSchedule } from '../types';
import { statusServiceInit } from '../services/robloxStatusService';

const cronJob: CronSchedule = {
    schedule: '*/10 * * * *',
    environment: 'PROD',

    execute: async function() {
        const job = new CronJob(this.schedule, async () => {
            try {
                await statusServiceInit();
            } catch {
                return;
            }
        });

        job.start();
    }
};

export default cronJob;