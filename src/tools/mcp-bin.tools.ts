import { Injectable } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import * as os from 'os';

@Injectable()
export class McpBinTools {
  constructor() {}

  @Tool({
    name: 'count-characters',
    description: 'Counts occurrences of a specific character in text',
    parameters: z.object({
      text: z.string().describe('The text to analyze'),
      character: z.string().describe('The character to count'),
    }),
  })
  async countCharacters({ text, character }, context: Context) {
    let count = 0;

    // Simple counting logic that's 100% accurate
    for (let i = 0; i < text.length; i++) {
      if (text[i] === character) {
        count++;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `There are ${count} occurrences of '${character}' in the text.`,
        },
      ],
    };
  }

  @Tool({
    name: 'get',
    description: 'get all MCP Server information for this request',
  })
  get(params, context: Context, httpRequest: Request) {
    // Extract all possible information from httpRequest while avoiding circular references
    const safeHttpRequest = this.extractRequestInfo(httpRequest);

    return {
      mcpRequest: context.mcpRequest,
      httpRequest: safeHttpRequest,
      serverInfo: getServerInfo(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractRequestInfo(req: any): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extracted: any = {};

    try {
      // Core HTTP properties
      this.safeAssign(extracted, 'method', req.method);
      this.safeAssign(extracted, 'url', req.url);
      this.safeAssign(extracted, 'headers', req.headers);
      this.safeAssign(extracted, 'httpVersion', req.httpVersion);
      this.safeAssign(extracted, 'httpVersionMajor', req.httpVersionMajor);
      this.safeAssign(extracted, 'httpVersionMinor', req.httpVersionMinor);

      // Express.js specific properties (if available)
      this.safeAssign(extracted, 'query', req.query);
      this.safeAssign(extracted, 'params', req.params);
      this.safeAssign(extracted, 'body', req.body);
      this.safeAssign(extracted, 'cookies', req.cookies);
      this.safeAssign(extracted, 'ip', req.ip);
      this.safeAssign(extracted, 'ips', req.ips);
      this.safeAssign(extracted, 'protocol', req.protocol);
      this.safeAssign(extracted, 'secure', req.secure);
      this.safeAssign(extracted, 'hostname', req.hostname);
      this.safeAssign(extracted, 'host', req.host);
      this.safeAssign(extracted, 'path', req.path);
      this.safeAssign(extracted, 'originalUrl', req.originalUrl);
      this.safeAssign(extracted, 'baseUrl', req.baseUrl);
      this.safeAssign(extracted, 'fresh', req.fresh);
      this.safeAssign(extracted, 'stale', req.stale);
      this.safeAssign(extracted, 'xhr', req.xhr);
      this.safeAssign(extracted, 'route', req.route);
      this.safeAssign(extracted, 'signedCookies', req.signedCookies);
      this.safeAssign(extracted, 'subdomains', req.subdomains);

      // Connection info (safe parts)
      if (req.connection) {
        extracted.connection = {};
        this.safeAssign(
          extracted.connection,
          'remoteAddress',
          req.connection.remoteAddress,
        );
        this.safeAssign(
          extracted.connection,
          'remoteFamily',
          req.connection.remoteFamily,
        );
        this.safeAssign(
          extracted.connection,
          'remotePort',
          req.connection.remotePort,
        );
        this.safeAssign(
          extracted.connection,
          'localAddress',
          req.connection.localAddress,
        );
        this.safeAssign(
          extracted.connection,
          'localPort',
          req.connection.localPort,
        );
        this.safeAssign(
          extracted.connection,
          'encrypted',
          req.connection.encrypted,
        );
      }

      // Additional metadata
      extracted.timestamp = new Date().toISOString();
      this.safeAssign(extracted, 'userAgent', req.headers?.['user-agent']);
      this.safeAssign(extracted, 'contentType', req.headers?.['content-type']);
      this.safeAssign(
        extracted,
        'contentLength',
        req.headers?.['content-length'],
      );
      this.safeAssign(extracted, 'accept', req.headers?.['accept']);
      this.safeAssign(
        extracted,
        'acceptEncoding',
        req.headers?.['accept-encoding'],
      );
      this.safeAssign(
        extracted,
        'acceptLanguage',
        req.headers?.['accept-language'],
      );
      this.safeAssign(extracted, 'referer', req.headers?.['referer']);
      this.safeAssign(extracted, 'origin', req.headers?.['origin']);
    } catch (error) {
      extracted.extractionError = `Error extracting request info: ${error}`;
    }

    return extracted;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeAssign(target: any, key: string, value: any): void {
    if (value !== undefined && value !== null) {
      try {
        // Test if the value can be serialized to JSON
        JSON.stringify(value);
        target[key] = value;
      } catch {
        // If serialization fails, store a string representation
        target[key] = String(value);
      }
    }
  }
}

function getServerInfo() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.0.1',
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    loadAverage: os.loadavg(),
    networkInterfaces: os.networkInterfaces(),
    userInfo: os.userInfo(),
    homeDir: os.homedir(),
    tempDir: os.tmpdir(),
    release: os.release(),
    type: os.type(),
  };
}
