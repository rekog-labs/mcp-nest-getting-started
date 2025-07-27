import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { GitHubOAuthProvider, McpAuthModule, McpModule } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { JwksAuthGuard } from './guards/jwks-auth.guard';
import { HealthController } from './controllers/health.controller';
import { WellKnownController } from './controllers/well-known.controller';
import { McpBinTools } from './tools/mcp-bin.tools';

@Module({
  imports: [
    // McpAuthModule.forRoot({
    //   provider: GitHubOAuthProvider,
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    //   jwtSecret: process.env.JWT_SECRET!,
    //   serverUrl: process.env.SERVER_URL,
    //   nodeEnv: process.env.NODE_ENV,
    //   apiPrefix: 'remote-auth',
    //   skipWellKnownOAuthAuthorizationServer: true,
    //   // endpoints: {
    //   //   authorize: 'http://localhost:3001/authorize',
    //   //   callback: 'http://localhost:3001/auth/callback',
    //   // },
    // }),

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
      guards: [JwksAuthGuard],
    }),
  ],
  controllers: [HealthController, WellKnownController],
  providers: [McpBinTools],
})
export class AppModule {}
