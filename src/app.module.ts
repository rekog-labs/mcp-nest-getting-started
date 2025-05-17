// src/app.module.ts
import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { CountingTool } from './counting.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'counting-tool-server',
      version: '1.0.0',
    }),
  ],
  providers: [CountingTool],
})
export class AppModule {}
