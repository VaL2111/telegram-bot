import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      return response.text ?? 'AI returned an empty response';
    } catch (error) {
      this.logger.error('Failed to generate content from Gemini', error);
      return 'Sorry, an error occurred while contacting Gemini AI';
    }
  }
}
