import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

@Injectable()
export class VisitorMiddleware implements NestMiddleware {
  constructor(private readonly analyticsService: AnalyticsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Get IP (handles cases where you are behind a proxy like Nginx/Cloudflare)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // We don't 'await' here so we don't delay the user's response
    this.analyticsService.trackVisit(ip, userAgent).catch(err => {
      console.error('Visitor Tracking Error:', err);
    });

    next();
  }
}