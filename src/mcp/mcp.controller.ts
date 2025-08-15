import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { McpAuthJwtGuard, McpStreamableHttpService } from '@rekog/mcp-nest';
import { TokenMetricsInterceptor } from '../metrics/token-metrics.interceptor';

/**
 * Advanced Streamable HTTP Controller - Direct use of McpStreamableHttpService
 * This controller demonstrates how to use McpStreamableHttpService directly
 * instead of relying on the factory pattern
 */
@Controller()
@UseInterceptors(TokenMetricsInterceptor)
export class StreamableHttpController {
  public readonly logger = new Logger(StreamableHttpController.name);

  constructor(
    public readonly mcpStreamableHttpService: McpStreamableHttpService,
  ) {}

  /**
   * Main HTTP endpoint for both initialization and subsequent requests
   */
  @UseGuards(McpAuthJwtGuard)
  @Post('/mcp')
  async handlePostRequest(
    @Req() req: any,
    @Res() res: any,
    @Body() body: unknown,
  ): Promise<void> {
    await this.mcpStreamableHttpService.handlePostRequest(req, res, body);
  }

  /**
   * GET endpoint for SSE streams - not supported in stateless mode
   */
  @UseGuards(McpAuthJwtGuard)
  @Get('/mcp')
  async handleGetRequest(@Req() req: any, @Res() res: any): Promise<void> {
    await this.mcpStreamableHttpService.handleGetRequest(req, res);
  }

  /**
   * DELETE endpoint for terminating sessions - not supported in stateless mode
   */
  @UseGuards(McpAuthJwtGuard)
  @Delete('/mcp')
  async handleDeleteRequest(@Req() req: any, @Res() res: any): Promise<void> {
    await this.mcpStreamableHttpService.handleDeleteRequest(req, res);
  }
}
