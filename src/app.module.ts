// src/app.module.ts
import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { GreetingPrompt } from './resources/greeting.prompt';
import { GreetingResource } from './resources/greeting.resource';
import { GreetingTool } from './resources/greeting.tool';
import { randomUUID } from 'crypto';

console.log('[app.module.ts] Defining AppModule');
@Module({
  imports: [
    McpModule.forRoot({
      name: 'counting-tool-server',
      version: '1.0.0',
      streamableHttp: {
        enableJsonResponse: false,
        sessionIdGenerator: () => randomUUID(),
        statelessMode: false,
      }
    }),
  ],
  providers: [GreetingPrompt, GreetingResource, GreetingTool],
})
export class AppModule {
  constructor() {
    console.log('[app.module.ts] AppModule constructed');
  }
}
console.log('[app.module.ts] AppModule defined');
