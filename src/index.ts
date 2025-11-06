/**
 * Bridge API - Entry Point
 * RESTful API with Domain-Driven Design
 */

import 'module-alias/register';

import { Server } from './server';
import { LoggerService } from '~infrastructure/logging/logger.service';

const logger = new LoggerService('Main');

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting Bridge API...');

    const server = new Server();
    await server.start();

    logger.info('Bridge API is running');
  } catch (error) {
    logger.error('Failed to start application', error as Error);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
bootstrap();

// Export for testing
export { Server };

// Legacy exports (for backward compatibility)
export * from './lib/async';
export * from './lib/number';
