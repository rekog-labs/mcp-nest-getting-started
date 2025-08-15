import { Injectable, OnModuleInit } from '@nestjs/common';
import { Tiktoken } from 'js-tiktoken/lite';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private tokenEncoder?: Tiktoken;
  public readonly register = new Registry();

  private toolInvocationsCounter: Counter<string>;
  private toolTokensCounter: Counter<string>;
  private toolRequestTokensCounter: Counter<string>;
  private toolResponseTokensCounter: Counter<string>;
  private toolDurationHistogram: Histogram<string>;
  private toolErrorsCounter: Counter<string>;
  private toolActiveRequestsGauge: Gauge<string>;
  private toolTokensPerMinuteGauge: Gauge<string>;

  // changed: make async and use dynamic import instead of require()
  async onModuleInit(): Promise<void> {
    // try to load the rank file dynamically to avoid TS module resolution issues
    try {
      const mod = await import('js-tiktoken/dist/ranks/o200k_base');
      const o200k = (mod && (mod.default ?? mod)) as any;
      this.tokenEncoder = new Tiktoken(o200k);
    } catch {
      try {
        // fallback path
        const mod = await import('js-tiktoken/dist/ranks/o200k_base');
        const o200k = (mod && (mod.default ?? mod)) as any;
        this.tokenEncoder = new Tiktoken(o200k);
      } catch {
        // leave tokenEncoder undefined; countTokens will fallback
        this.tokenEncoder = undefined;
      }
    }
    // collectDefaultMetrics({ register: this.register });

    this.toolInvocationsCounter = new Counter({
      name: 'mcp_tool_invocations_total',
      help: 'Total number of tool invocations',
      labelNames: ['method', 'tool', 'status'],
      registers: [this.register],
    });

    this.toolTokensCounter = new Counter({
      name: 'mcp_tool_tokens_total',
      help: 'Total tokens processed by tool',
      labelNames: ['method', 'tool'],
      registers: [this.register],
    });

    this.toolRequestTokensCounter = new Counter({
      name: 'mcp_tool_request_tokens_total',
      help: 'Request tokens processed by tool',
      labelNames: ['method', 'tool'],
      registers: [this.register],
    });

    this.toolResponseTokensCounter = new Counter({
      name: 'mcp_tool_response_tokens_total',
      help: 'Response tokens processed by tool',
      labelNames: ['method', 'tool'],
      registers: [this.register],
    });

    this.toolDurationHistogram = new Histogram({
      name: 'mcp_tool_duration_milliseconds',
      help: 'Tool execution duration in milliseconds',
      labelNames: ['method', 'tool', 'status'],
      buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [this.register],
    });

    this.toolErrorsCounter = new Counter({
      name: 'mcp_tool_errors_total',
      help: 'Total number of tool errors',
      labelNames: ['method', 'tool', 'error_type'],
      registers: [this.register],
    });

    this.toolActiveRequestsGauge = new Gauge({
      name: 'mcp_tool_active_requests',
      help: 'Number of active requests per tool',
      labelNames: ['method', 'tool'],
      registers: [this.register],
    });

    this.toolTokensPerMinuteGauge = new Gauge({
      name: 'mcp_tool_tokens_per_minute',
      help: 'Tokens processed per minute by tool',
      labelNames: ['method', 'tool'],
      registers: [this.register],
    });
  }

  countTokens(text: string): number {
    if (!text) return 0;
    try {
      if (this.tokenEncoder) {
        const encoded = this.tokenEncoder.encode(text);
        return encoded.length;
      }
      // if tokenEncoder not available, fallback below
    } catch (error) {
      // continue to fallback
    }

    // fallback: approximate by words
    try {
      return text.split(/\s+/).filter(Boolean).length;
    } catch {
      return 0;
    }
  }

  incrementActiveRequests(toolName: string): void {
    this.toolActiveRequestsGauge.inc({ tool: toolName });
  }

  decrementActiveRequests(toolName: string): void {
    this.toolActiveRequestsGauge.dec({ tool: toolName });
  }

  recordToolInvocation(params: {
    methodName: string;
    toolName: string;
    requestPayload: any;
    responsePayload: any;
    durationMs: number;
    status: 'success' | 'error';
    errorType?: string;
  }): void {
    const {
      methodName,
      toolName,
      requestPayload,
      responsePayload,
      durationMs,
      status,
      errorType,
    } = params;

    const requestTokens = this.countTokens(JSON.stringify(requestPayload));
    const responseTokens = this.countTokens(JSON.stringify(responsePayload));
    const totalTokens = requestTokens + responseTokens;

    this.toolInvocationsCounter.inc({
      method: methodName,
      tool: toolName,
      status,
    });

    this.toolTokensCounter.inc(
      { method: methodName, tool: toolName },
      totalTokens,
    );

    this.toolRequestTokensCounter.inc(
      { method: methodName, tool: toolName },
      requestTokens,
    );

    this.toolResponseTokensCounter.inc(
      { method: methodName, tool: toolName },
      responseTokens,
    );

    this.toolDurationHistogram.observe(
      { method: methodName, tool: toolName, status },
      durationMs,
    );

    if (status === 'error' && errorType) {
      this.toolErrorsCounter.inc({
        method: methodName,
        tool: toolName,
        error_type: errorType,
      });
    }

    this.updateTokensPerMinute(toolName, totalTokens);
  }

  private tokenRateMap = new Map<
    string,
    { tokens: number[]; timestamps: number[] }
  >();

  private updateTokensPerMinute(toolName: string, tokens: number): void {
    const key = `${toolName}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.tokenRateMap.has(key)) {
      this.tokenRateMap.set(key, { tokens: [], timestamps: [] });
    }

    const data = this.tokenRateMap.get(key)!;
    data.tokens.push(tokens);
    data.timestamps.push(now);

    while (data.timestamps.length > 0 && data.timestamps[0] < oneMinuteAgo) {
      data.timestamps.shift();
      data.tokens.shift();
    }

    const tokensInLastMinute = data.tokens.reduce((sum, t) => sum + t, 0);
    this.toolTokensPerMinuteGauge.set({ tool: toolName }, tokensInLastMinute);
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getMetricsContentType(): string {
    return this.register.contentType;
  }
}
