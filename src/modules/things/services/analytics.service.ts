import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../models/visitor.schema';
import * as UAParserJs from 'ua-parser-js';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Visitor.name) private visitorModel: Model<Visitor>) {}

  async trackVisit(ip: string, userAgent: string) {
    // Fix for "not constructable" error: access the constructor specifically
    const parser = new UAParserJs.UAParser(userAgent);
    const result = parser.getResult();

    // Create a unique hash to identify the unique user/device
    const fingerprint = crypto
      .createHash('md5')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    // Upsert: Find by fingerprint, update details if it exists, or create new if not.
    return await this.visitorModel.findOneAndUpdate(
      { fingerprint },
      {
        ip,
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        deviceType: result.device.type || 'desktop',
        lastVisit: new Date(),
      },
      { upsert: true, new: true },
    );
  }

  async getAdminStats() {
    const totalUnique = await this.visitorModel.countDocuments();
    
    // Aggregation to get device counts (e.g., mobile: 50, desktop: 20)
    const deviceStats = await this.visitorModel.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    return {
      totalUniqueUsers: totalUnique,
      devices: deviceStats,
    };
  }
}