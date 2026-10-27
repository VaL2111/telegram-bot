import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [BotService],
})
export class BotModule {}
