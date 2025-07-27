// src/app.module.ts
import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { GreetingPrompt } from './resources/greeting.prompt';
import { GreetingResource } from './resources/greeting.resource';
import { GreetingTool } from './resources/greeting.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'counting-tool-server',
      version: '1.0.0',
    }),
  ],
  providers: [GreetingPrompt, GreetingResource, GreetingTool],
})
export class AppModule {}
