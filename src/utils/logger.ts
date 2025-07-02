import chalk from "chalk";

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

class Logger {
  private level: LogLevel = "info";
  private isInteractive: boolean = false;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setInteractive(interactive: boolean) {
    this.isInteractive = interactive;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      silent: 4,
    };
    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;

    let coloredMessage: string;
    switch (level) {
      case "debug":
        coloredMessage = chalk.gray(`${prefix} ${message}`);
        break;
      case "info":
        coloredMessage = chalk.blue(`${prefix} ${message}`);
        break;
      case "warn":
        coloredMessage = chalk.yellow(`${prefix} ⚠️  ${message}`);
        break;
      case "error":
        coloredMessage = chalk.red(`${prefix} ❌ ${message}`);
        break;
      default:
        coloredMessage = `${prefix} ${message}`;
    }

    if (data) {
      coloredMessage += chalk.gray(`\n${JSON.stringify(data, null, 2)}`);
    }

    return coloredMessage;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog("info") && !this.isInteractive) {
      console.log(this.formatMessage("info", message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, data));
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, error));
    }
  }

  // Special methods for interactive mode
  success(message: string) {
    console.log(chalk.green(`✅ ${message}`));
  }

  progress(message: string) {
    if (!this.isInteractive) {
      console.log(chalk.cyan(`🔄 ${message}`));
    }
  }

  section(title: string) {
    console.log(chalk.bold.cyan(`\n=== ${title} ===`));
  }
}

export const logger = new Logger();
// export const logger = {
//   info: (message: string, data?: any) => {
//     console.log(
//       `[INFO] ${new Date().toISOString()} - ${message}`,
//       data ? JSON.stringify(data, null, 2) : ""
//     );
//   },

//   error: (message: string, error?: any) => {
//     console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
//   },

//   warn: (message: string, data?: any) => {
//     console.warn(
//       `[WARN] ${new Date().toISOString()} - ${message}`,
//       data ? JSON.stringify(data, null, 2) : ""
//     );
//   },

//   debug: (message: string, data?: any) => {
//     if (process.env.DEBUG) {
//       console.debug(
//         `[DEBUG] ${new Date().toISOString()} - ${message}`,
//         data ? JSON.stringify(data, null, 2) : ""
//       );
//     }
//   },
// };
