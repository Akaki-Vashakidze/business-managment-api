import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { ItemManagement } from '../models/itemManagement.schema';
import { RecordState } from 'src/modules/base/enums/record-state.enum';
import { SmsService } from './sms.service';

// Interface to tell TypeScript that 'user' is populated with a mobileNumber
interface PopulatedUser {
  _id: Types.ObjectId;
  mobileNumber: string;
  fullName?: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(ItemManagement.name) private itemManagement: Model<ItemManagement>,
    private smsService: SmsService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReservationExpirations() {
    const now = new Date();
    
    // Normalize time components for accurate comparison
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const todayStart = new Date(currentYear, currentMonth, currentDate);
    const todayEnd = new Date(currentYear, currentMonth, currentDate + 1);

    /**
     * Find items where:
     * 1. record.state is ACTIVE (1)
     * 2. (Date is before today) OR (Date is today AND end time has passed)
     */
    const expiredItems = await this.itemManagement.find({
      'record.state': RecordState.ACTIVE,
      $or: [
        { date: { $lt: todayStart } },
        {
          date: { $gte: todayStart, $lt: todayEnd },
          $or: [
            { endHour: { $lt: currentHour } },
            { endHour: currentHour, endMinute: { $lte: currentMin } }
          ]
        }
      ]
    }).populate('user');

    if (expiredItems.length > 0) {
      for (const item of expiredItems) {
        try {
          // 1. Log the finish for debugging
          this.logger.log(`Finished: Reservation ${item._id} for item ${item.item}`);

          // 2. Set state to INACTIVE (0)
          await this.itemManagement.findByIdAndUpdate(item._id, {
            $set: { 'record.state': RecordState.INACTIVE }
          });

          // 3. Handle SMS Notification
          // Cast item.user to PopulatedUser to fix the "mobileNumber does not exist" error
          const user = item.user as unknown as PopulatedUser;

          if (user && user.mobileNumber) {
            const message = `Your gaming session has ended.`;
            await this.smsService.send(user.mobileNumber, message);
            this.logger.debug(`SMS notification sent to ${user.mobileNumber}`);
          } else {
            this.logger.warn(`No mobile number found for user in reservation ${item._id}`);
          }

        } catch (error) {
          this.logger.error(`Error processing expired reservation ${item._id}: ${error.message}`);
        }
      }

      this.logger.log(`Cleanup complete. Processed ${expiredItems.length} expired reservations.`);
    }
  }
}