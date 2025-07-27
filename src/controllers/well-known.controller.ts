import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {
  private resource: string;
  constructor() {
    if (!process.env.SERVER_IDENTIFIER) {
      throw new Error('SERVER_IDENTIFIER environment variable is not set. It is required to identify the resource.');
    }
    this.resource = process.env.SERVER_IDENTIFIER;
  }

  @Get('oauth-protected-resource')
  getOAuthProtectedResource() {
    return {
      resource: this.resource,
      authorization_servers: ['http://localhost:3001'],
      // jwks_uri:
      //   'http://localhost:8080/realms/mcp/protocol/openid-connect/certs',
      bearer_methods_supported: ['header', 'body', 'query'],
      scopes_supported: ['profile', 'offline_access'],
      resource_documentation: 'http://localhost:3002/docs',
      resource_policy_uri: 'http://localhost:3002/policy',
      resource_tos_uri: 'http://localhost:3002/tos',
    };
  }
}
