import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class TokenMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TokenMetrics');

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    console.log(JSON.stringify(body, null, 2));
    const methodName = this.extractMethodName(body);
    const toolName = this.extractToolName(body);

    if (!toolName || !methodName) {
      return next.handle();
    }

    const startTime = Date.now();
    const requestPayload = body?.params?.arguments || body?.params || {};

    this.metricsService.incrementActiveRequests(toolName);

    return next.handle().pipe(
      tap((response) => {
        const durationMs = Date.now() - startTime;

        this.metricsService.recordToolInvocation({
          methodName,
          toolName,
          requestPayload,
          responsePayload: response,
          durationMs,
          status: 'success',
        });

        this.logger.debug({
          event: 'tool_invocation_success',
          toolName,
          durationMs,
          requestTokens: this.metricsService.countTokens(
            JSON.stringify(requestPayload),
          ),
          responseTokens: this.metricsService.countTokens(
            JSON.stringify(response),
          ),
        });
      }),
      catchError((error) => {
        const durationMs = Date.now() - startTime;

        this.metricsService.recordToolInvocation({
          methodName,
          toolName,
          requestPayload,
          responsePayload: {},
          durationMs,
          status: 'error',
          errorType: error?.name || 'UnknownError',
        });

        this.logger.error({
          event: 'tool_invocation_error',
          toolName,
          methodName,
          durationMs,
          error: error?.message,
        });

        return throwError(() => error);
      }),
      finalize(() => {
        this.metricsService.decrementActiveRequests(toolName);
      }),
    );
  }

  private extractMethodName(body: any): string | null {
    return body?.method || null;
  }

  private extractToolName(body: any): string | null {
    if (body?.method === 'tools/call') {
      return body.params.name;
    }
    return body?.params?.name;
  }
}
