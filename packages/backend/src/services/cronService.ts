import cron from 'node-cron';
import { config } from '../config.js';
import { checkAndUpdateAll } from './guideService.js';

export function startCron(): void {
  const schedule = config.cronSchedule;
  console.log(`[cron] Scheduling daily APL update check: "${schedule}" (UTC)`);

  cron.schedule(schedule, async () => {
    console.log('[cron] Daily update triggered');
    try {
      await checkAndUpdateAll();
    } catch (err) {
      console.error('[cron] Update failed:', err);
    }
  }, { timezone: 'UTC' });
}
