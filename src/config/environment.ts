/**
 * Environment Configuration
 * Centralized environment variable management
 */

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];

  // Database
  databaseUrl: string;

  // Salesforce
  salesforceInstanceUrl: string;
  salesforceAccessToken: string;
  salesforceApiVersion: string;

  // Redis
  redisUrl: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;

  // Logging
  logLevel: string;
}

/**
 * Load environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],

    // Database
    databaseUrl:
      process.env.DATABASE_URL || 'postgresql://localhost:5432/bridge_api',

    // Salesforce
    salesforceInstanceUrl: process.env.SALESFORCE_INSTANCE_URL || '',
    salesforceAccessToken: process.env.SALESFORCE_ACCESS_TOKEN || '',
    salesforceApiVersion: process.env.SALESFORCE_API_VERSION || 'v55.0',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
