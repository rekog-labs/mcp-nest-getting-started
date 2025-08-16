import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { GitHubOAuthProvider, McpAuthModule, McpModule } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { CountingTool } from './mcp/counting.tool';
import { StreamableHttpController } from './mcp/mcp.controller';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';

import * as dotenv from 'dotenv';

dotenv.config();

// Central configuration factory; extend as needed
const mcpServerConfig = () => ({
  mcp: {
    name: process.env.MCP_SERVER_NAME || 'counting-tool-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mcpServerConfig],
      cache: true,
      expandVariables: true,
    }),
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

    McpModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: config.get<string>('mcp.name', 'counting-tool-server'),
        version: config.get<string>('mcp.version', '1.0.0'),
        streamableHttp: {
          enableJsonResponse: false,
          sessionIdGenerator: () => randomUUID(),
          statelessMode: false,
        },
      }),
    }),
  ],
  providers: [CountingTool, MetricsService],
  controllers: [StreamableHttpController, MetricsController],
})
export class AppModule {}
