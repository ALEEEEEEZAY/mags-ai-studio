import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: 'MAGS AI Studio API',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      description: 'AI SaaS platform like Cursor / Claude / OpenAI assistant',
    };
  }
}
