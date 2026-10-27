import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf<Context>;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new Telegraf(token);
  }

  onModuleInit() {
    this.registerHandlers();

    void this.bot.launch(() => {
      this.logger.log('Telegram bot successfully started');
    });
  }

  onModuleDestroy() {
    this.bot.stop('SIGTERM');
  }

  private registerHandlers() {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        'Привіт! Оберіть потрібний пункт меню нижче:',
        Markup.keyboard([
          ['Student', 'IT-tech'],
          ['Contacts', 'Prompt-AI'],
        ]).resize(),
      );
    });

    this.bot.hears('Student', async (ctx) => {
      await ctx.reply('Student:\nBakhmatskyi V.V.\nGroup: IM-31');
    });

    this.bot.hears('IT-tech', async (ctx) => {
      await ctx.reply(
        'Technology stack:\nTypeScript\nJavaScript\nNestJS\nNode.js\nLinux: Fedora',
      );
    });

    this.bot.hears('Contacts', async (ctx) => {
      await ctx.reply('phone: +380985287213\nemail: val.shine@gmail.com');
    });

    this.bot.hears('Prompt-AI', async (ctx) => {
      await ctx.reply(
        'Write your request for Gemini AI in the following message:',
      );
    });
  }
}
