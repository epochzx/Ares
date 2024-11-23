
/*import { join } from 'path';
import getFiles from '../utils/fileHelper';*/

export default async function loadCronJobs(): Promise<void> {
    return;
    /*const cronJobsDir = join(__dirname, '../cronJobs');
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
    }*/
}