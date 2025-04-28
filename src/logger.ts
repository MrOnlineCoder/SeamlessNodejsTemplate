export interface Logger {
  info(tag: string, message: string, meta?: any): void;
  error(tag: string, message: string, meta?: any): void;
}

export class ConsoleLogger implements Logger {
  info(tag: string, message: string, meta?: any): void {
    console.log(
      `<${new Date().toLocaleString()}> [INFO] [${tag}] ${message}`,
      meta ?? {}
    );
  }

  error(tag: string, message: string, meta?: any): void {
    console.error(
      `<${new Date().toLocaleString()}> [ERROR] [${tag}] ${message}`,
      meta ?? {}
    );
  }
}
