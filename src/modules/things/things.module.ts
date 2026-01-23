
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MongooseModels from './models';import * as dotenv from 'dotenv'; 
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

dotenv.config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DB_URL!),
        MongooseModule.forFeature(MongooseModels),
    ],
    controllers: [AuthController, BusinessController, BranchController, ItemController],
    providers: [AuthService, MailService, JwtTokenService, BusinessService, BranchesService, ItemsService],
})
export class ThingsModule {
    constructor() {
    }
}