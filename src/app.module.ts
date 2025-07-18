import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { GitHubOAuthProvider, McpAuthModule, McpModule } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { CountingTool } from './counting.tool';
import { JwtAuthGuard } from '@rekog/mcp-nest/dist/authz/guards/jwt-auth.guard';

@Module({
  imports: [
    McpAuthModule.forRoot({
      provider: GitHubOAuthProvider,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      jwtSecret: process.env.JWT_SECRET!,
      serverUrl: process.env.SERVER_URL,
      nodeEnv: process.env.NODE_ENV,
      apiPrefix: 'remote-auth',
    }),

    McpModule.forRoot({
      name: 'remote',
      version: '1.0.0',
      apiPrefix: 'remote',
      streamableHttp: {
        enableJsonResponse: false,
        sessionIdGenerator: () => randomUUID(),
        statelessMode: false,
      },
    }),
    McpModule.forRoot({
      name: 'remote-auth',
      version: '1.0.0',
      apiPrefix: 'remote-auth',
      streamableHttp: {
        enableJsonResponse: false,
        sessionIdGenerator: () => randomUUID(),
        statelessMode: false,
      },
      guards: [JwtAuthGuard],
    }),
  ],
  providers: [CountingTool],
})
export class AppModule {}
