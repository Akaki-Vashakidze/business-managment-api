import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThingsModule } from './modules/things/things.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ThingsModule,ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
