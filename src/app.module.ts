import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { CountingTool } from './counting.tool';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'counting-tool-server',
      version: '1.0.0',
      streamableHttp: {
        enableJsonResponse: false,
        sessionIdGenerator: () => randomUUID(),
        statelessMode: false,
      },
    }),
  ],
  providers: [CountingTool],
})
export class AppModule {}
