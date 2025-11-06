import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import { errorHandler } from '~api/rest/middlewares/error.middleware';
import { createApiRoutes } from '~api/rest/routes';
import { DIContainer, setGlobalContainer } from '~config/dependency-injection';
import { EnvironmentConfig, loadEnvironmentConfig } from '~config/environment';
import { LoggerService } from '~infrastructure/logging/logger.service';

/**
 * Server Configuration
 */
export class Server {
  private app: Express;
  private config: EnvironmentConfig;
  private container: DIContainer;
  private logger: LoggerService;

  constructor() {
    this.app = express();
    this.config = loadEnvironmentConfig();
    this.container = DIContainer.getInstance(this.config);
    setGlobalContainer(this.container);
    this.logger = new LoggerService('Server');

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup global middlewares
   */
  private setupMiddlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: this.config.corsOrigins,
        credentials: true,
      })
    );

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, _res, next) => {
      this.logger.info(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Bridge API',
        version: '1.0.0',
        description: 'RESTful API with DDD architecture',
        environment: this.config.nodeEnv,
      });
    });

    // API routes
    const apiRoutes = createApiRoutes({
      cartController: this.container.cartController,
      orderController: this.container.orderController,
      productController: this.container.productController,
    });

    this.app.use(this.config.apiPrefix, apiRoutes);

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({
        error: {
          message: 'Route not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.config.port, () => {
        this.logger.info(`Server started successfully`, {
          port: this.config.port,
          environment: this.config.nodeEnv,
          apiPrefix: this.config.apiPrefix,
        });
        resolve();
      });
    });
  }

  /**
   * Get Express app instance
   */
  public getApp(): Express {
    return this.app;
  }
}
