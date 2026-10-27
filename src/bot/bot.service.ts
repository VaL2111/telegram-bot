import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { message } from 'telegraf/filters';
import { AiService } from '../ai/ai.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf<Context>;
  private readonly awaitingPromptUsers = new Set<number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
  ) {
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
      this.awaitingPromptUsers.add(ctx.from.id);
      await ctx.reply(
        'Write your request for Gemini AI in the following message:',
      );
    });

    this.bot.on(message('text'), async (ctx) => {
      const userId = ctx.from.id;

      if (!this.awaitingPromptUsers.has(userId)) {
        await ctx.reply(
          'Please select an option from the menu or click "Prompt-AI" first.',
        );
        return;
      }

      this.awaitingPromptUsers.delete(userId);
      await ctx.sendChatAction('typing');

      const answer = await this.aiService.generateText(ctx.message.text);
      await ctx.reply(answer);
    });
  }
}
