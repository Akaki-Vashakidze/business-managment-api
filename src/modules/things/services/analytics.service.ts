import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../models/visitor.schema';
import * as UAParserJs from 'ua-parser-js';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Visitor.name) private visitorModel: Model<Visitor>) {}

  async trackVisit(ip: string, userAgent: string, cookieId?: string) {
    const parser = new UAParserJs.UAParser(userAgent);
    const result = parser.getResult();

    // Use SHA256 for better collision resistance than MD5
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    // Identity priority: Cookie ID > Fingerprint
    const identity = cookieId || fingerprint;

    return await this.visitorModel.findOneAndUpdate(
      { visitorId: identity },
      {
        $set: {
          ip,
          fingerprint,
          browser: result.browser.name || 'Unknown',
          os: result.os.name || 'Unknown',
          deviceType: result.device.type || 'desktop',
          lastVisit: new Date(),
        },
        $inc: { totalVisits: 1 },
      },
      { upsert: true, new: true },
    );
  }

  async getAdminStats() {
    const stats = await this.visitorModel.aggregate([
      {
        $group: {
          _id: null,
          totalUniqueUsers: { $sum: 1 },
          totalPageHits: { $sum: '$totalVisits' },
        },
      },
    ]);

    const deviceStats = await this.visitorModel.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    return {
      totalUniqueUsers: stats[0]?.totalUniqueUsers || 0,
      totalPageHits: stats[0]?.totalPageHits || 0,
      devices: deviceStats,
    };
  }

  async getTodaysUniqueUsers() {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0); // Use UTC for 99.9% accuracy

    const count = await this.visitorModel.countDocuments({
      lastVisit: { $gte: startOfToday },
    });

    return { todayUniqueUsers: count };
  }

  async getLastWeekUniqueUsers() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const count = await this.visitorModel.countDocuments({
      lastVisit: { $gte: sevenDaysAgo },
    });

    return { lastWeekUniqueUsers: count };
  }
}