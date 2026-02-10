// admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtTokenService } from '../services/jwt-token.service';
import { Helper } from '../utils/helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private adminService: AdminService,
        private jwtTokenService: JwtTokenService,
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const userId = Helper.getUserIdFromHeaderToken(request, this.jwtTokenService);

            if (!userId) {
                throw new UnauthorizedException('Invalid token');
            }

            let user = await this.userModel.findById(userId)

            if (user?.isManager || user?.isOwner) {
                request['user'] = { userId };
                return true;
            } else {
                throw new ForbiddenException('Access denied: You are not an active admin');
            }
        } catch (error) {
            throw new ForbiddenException('Admin privileges required');
        }
    }
}