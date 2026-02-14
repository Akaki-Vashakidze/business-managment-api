import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'; // Added MiddlewareConsumer & NestModule
import { MongooseModule } from '@nestjs/mongoose';
import MongooseModels from './models';
import * as dotenv from 'dotenv'; 
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { MailService } from './services/mail.service';
import { JwtTokenService } from './services/jwt-token.service';
import { BusinessController } from './controllers/business.controller';
import { BusinessService } from './services/business.service';
import { BranchController } from './controllers/branches.controller';
import { BranchesService } from './services/branches.service';
import { ItemController } from './controllers/item.controller';
import { ItemsService } from './services/items.service';
import { ItemManagementService } from './services/itemManagement.service';
import { ItemManagementController } from './controllers/itemManagement.controller';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { MembershipController } from './controllers/membership.controller';
import { MembershipService } from './services/membership.service';
import { SiteController } from './controllers/site.controller';
import { SiteService } from './services/site.service';
import { TasksService } from './services/task.service';
import { SmsService } from './services/sms.service';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { AnalyticsService } from './services/analytics.service';
import { VisitorMiddleware } from './middlewares/visitor.middleware'; 

dotenv.config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DB_URL!),
        MongooseModule.forFeature(MongooseModels),
    ],
    controllers: [
        AuthController, 
        BusinessController, 
        BranchController, 
        ItemController, 
        ItemManagementController, 
        UserController, 
        MembershipController, 
        SiteController, 
        AdminController,
    ],
    providers: [
        AuthService, 
        MailService, 
        JwtTokenService, 
        BusinessService, 
        BranchesService, 
        ItemsService, 
        ItemManagementService, 
        UserService, 
        MembershipService, 
        SiteService, 
        TasksService, 
        SmsService, 
        AdminService, 
        AnalyticsService
    ],
})
// Change this line to implement NestModule
export class ThingsModule implements NestModule {
    constructor() {}

    // Add this method to register the middleware
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(VisitorMiddleware)
            .forRoutes('*'); // This will track every request to every controller
    }
}