import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { ItemManagement } from '../models/itemManagement.schema';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(@InjectModel(ItemManagement.name) private itemManagement: Model<ItemManagement>) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.debug('Running cleanup for items older than 2 days...');
    
    const cutoffDate = new Date();
    // 1. Set to the very start of today
    cutoffDate.setHours(0, 0, 0, 0);
    // 2. Subtract 2 full days
    cutoffDate.setDate(cutoffDate.getDate() - 2);

    // This means: if today is Feb 4, cutoff is Feb 2 at 00:00.
    // Anything LESS THAN ($lt) Feb 2 (meaning Feb 1, Jan 31, etc.) gets deleted.
    const result = await this.itemManagement.deleteMany({
      date: { $lt: cutoffDate }
    });

    this.logger.log(`Cleanup complete. Removed ${result.deletedCount} items older than ${cutoffDate.toDateString()}.`);
  }
}