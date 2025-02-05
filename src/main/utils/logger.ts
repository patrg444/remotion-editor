export class Logger {
  constructor(private name: string) {}

  info(message: string, data?: any) {
    console.log(`[${this.name}] ${message}`, data);
  }

  error(message: string, error?: any) {
    console.error(`[${this.name}] ${message}`, error);
  }

  warn(message: string, data?: any) {
    console.warn(`[${this.name}] ${message}`, data);
  }

  debug(message: string, data?: any) {
    console.debug(`[${this.name}] ${message}`, data);
  }
}
