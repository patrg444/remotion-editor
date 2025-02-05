export class Logger {
  constructor(private name: string) {}

  debug(...args: any[]) {}
  info(...args: any[]) {}
  warn(...args: any[]) {}
  error(...args: any[]) {}
}

export default Logger;
