/**
 * Application logger with configurable levels and environments
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig = {
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
    enabled: true,
    prefix: '[Timeline]'
  };

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private formatMessage(level: string, message: any, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    return `${timestamp} ${prefix}[${level}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level;
  }

  public debug(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  public info(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  public warn(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  public error(message: any, error?: Error, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), error || '', ...args);
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }

  // Performance logging
  public time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(`${this.config.prefix} ${label}`);
    }
  }

  public timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(`${this.config.prefix} ${label}`);
    }
  }

  // Group logging for related messages
  public group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(this.formatMessage('GROUP', label));
    }
  }

  public groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Usage examples:
// logger.configure({ level: LogLevel.DEBUG }); // Configure globally
// logger.debug('Initializing timeline');
// logger.info('Timeline ready');
// logger.warn('Performance degradation detected');
// logger.error('Failed to load clip', new Error('Network error'));
// 
// logger.time('Render duration');
// // ... rendering code
// logger.timeEnd('Render duration');
//
// logger.group('Timeline Update');
// logger.debug('Updating clips');
// logger.debug('Recalculating layout');
// logger.groupEnd();
