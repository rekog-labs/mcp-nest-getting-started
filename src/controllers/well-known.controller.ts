import { Controller, Get } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {
  @Get('oauth-protected-resource')
  getOAuthProtectedResource() {
    return {
      resource: 'http://localhost:3001',
      authorization_servers: ['http://localhost:3002'],
      // jwks_uri:
      //   'http://localhost:8080/realms/mcp/protocol/openid-connect/certs',
      bearer_methods_supported: ['header', 'body', 'query'],
      scopes_supported: ['profile', 'offline_access'],
      resource_documentation: 'http://localhost:3001/docs',
      resource_policy_uri: 'http://localhost:3001/policy',
      resource_tos_uri: 'http://localhost:3001/tos',
    };
  }
}
