// src/infrastructure/persistence/prisma/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    console.log('Initializing PrismaService...'); 
    console.log('Database URL:', config.get<string>('DATABASE_URL'));
    // 1. Créer le pool PostgreSQL
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const pool = new Pool({
      connectionString,
      max: config.get<number>('DB_POOL_MAX', 20),
      idleTimeoutMillis: config.get<number>('DB_IDLE_TIMEOUT', 30000),
      connectionTimeoutMillis: config.get<number>('DB_CONNECTION_TIMEOUT', 2000),
    });

    // 2. Créer l'adapter Prisma avec le pool
    const adapter = new PrismaPg(pool);

    // 3. Initialiser PrismaClient avec l'adapter
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.pool = pool;
    this.setupLogging();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');

      // Test de connexion
      const result = await this.pool.query('SELECT NOW() as current_time');
      this.logger.log(`📅 Database time: ${result.rows[0].current_time}`);
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('🔌 Database and connection pool closed');
    } catch (error) {
      this.logger.error('❌ Error during disconnect:', error);
    }
  }

  private setupLogging() {
    // Query logging (development only)
    this.$on('query' as never, (e: any) => {
      if (this.config.get('NODE_ENV') === 'development') {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      }
    });

    // Error logging
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });

    // Warning logging
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });

    // Info logging
    this.$on('info' as never, (e: any) => {
      this.logger.log(`Prisma Info: ${e.message}`);
    });
  }

  /**
   * Vérifie la santé de la connexion à la base de données
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1 as health`;
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques du pool de connexions
   */
  getPoolStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }

  /**
   * Nettoie toutes les tables de la base de données
   * ⚠️ ATTENTION : À utiliser uniquement en développement ou test
   */
  async cleanDatabase() {
    const environment = this.config.get('NODE_ENV');
    
    if (environment === 'production') {
      throw new Error('❌ Cannot clean database in production environment!');
    }

    this.logger.warn('🧹 Cleaning database...');

    // Récupère tous les modèles Prisma
    const modelNames = Reflect.ownKeys(this).filter(
      (key) =>
        typeof key === 'string' &&
        !key.startsWith('_') &&
        !key.startsWith('$') &&
        typeof (this as any)[key] === 'object' &&
        (this as any)[key]?.deleteMany,
    );

    // Supprime toutes les données dans l'ordre inverse (évite les contraintes FK)
    const deleteOperations = modelNames.reverse().map((modelName) => {
      const model = (this as any)[modelName];
      return model.deleteMany();
    });

    try {
      await this.$transaction(deleteOperations);
      this.logger.warn('✅ Database cleaned successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clean database:', error);
      throw error;
    }
  }

  /**
   * Exécute une transaction avec retry
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Transaction attempt ${attempt}/${maxRetries} failed: ${lastError.message}`,
        );

        if (attempt < maxRetries) {
          // Attendre avant de réessayer (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 100),
          );
        }
      }
    }

    throw new Error(
      `Transaction failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }
}