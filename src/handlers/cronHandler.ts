
import { join } from 'path';
import getFiles from '../utils/fileHelper';
import settings from '../settings.json';

export default async function loadCronJobs(): Promise<void> {
    if (!settings.loadCron) {
        console.log(`✖️   Cron job loading has been disabled`);

        return;
    }

    const cronJobsDir = join(__dirname, '../cronJobs');
    const cronJobFiles = getFiles(cronJobsDir);

    let loadedCount = 0;

    for (const filePath of cronJobFiles) {
        try {
            const jobModule = await import(filePath);
            const job = jobModule.default;

            job.execute();
            loadedCount++;
        } catch (error) {
            console.log(`❌  Failed to load cron job from ${filePath}: ${error}`);

            return;
        }
    }

    if (loadedCount == 0) {
        console.log(`❌  0 cron jobs to load`);
    }
}