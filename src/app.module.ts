import { Module } from '@nestjs/common';

import { GitHubOAuthProvider, McpAuthModule, McpModule } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { CountingTool } from './mcp/counting.tool';
import { StreamableHttpController } from './mcp/mcp.controller';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';

import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    McpAuthModule.forRoot({
      provider: GitHubOAuthProvider,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      jwtSecret: process.env.JWT_SECRET!,
      serverUrl: process.env.SERVER_URL,
      resource: process.env.SERVER_URL + '/mcp',
      cookieSecure: process.env.NODE_ENV === 'production',
      apiPrefix: 'auth',
      endpoints: {
        wellKnownAuthorizationServerMetadata:
          '/.well-known/oauth-authorization-server',
        wellKnownProtectedResourceMetadata: [
          '/.well-known/oauth-protected-resource/mcp',
          '/.well-known/oauth-protected-resource',
        ],
      },
    }),

    McpModule.forRoot({
      name: 'counting-tool-server',
      version: '1.0.0',
      streamableHttp: {
        enableJsonResponse: false,
        sessionIdGenerator: () => randomUUID(),
        statelessMode: false,
      },
      transport: [],
    }),
  ],
  providers: [CountingTool, MetricsService],
  controllers: [StreamableHttpController, MetricsController],
})
export class AppModule {}
