import { app } from 'electron'
import { join } from 'path'
import { appendFileSync, mkdirSync, existsSync, readdirSync, unlinkSync, statSync } from 'fs'

class Logger {
  private logDir: string

  constructor() {
    this.logDir = join(app.getPath('userData'), 'logs')
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true })
    }
    this.cleanup()
  }

  private cleanup(): void {
    try {
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
      const now = Date.now()
      const files = readdirSync(this.logDir)

      for (const file of files) {
        if (!file.endsWith('.log')) continue
        const filePath = join(this.logDir, file)
        const stat = statSync(filePath)
        if (now - stat.mtimeMs > maxAge) {
          unlinkSync(filePath)
        }
      }
    } catch {
      // Silently ignore cleanup errors
    }
  }

  private getLogPath(): string {
    const date = new Date().toISOString().split('T')[0]
    return join(this.logDir, `${date}.log`)
  }

  private write(level: string, module: string, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString()
    const line = JSON.stringify({ timestamp, level, module, message, ...meta })
    appendFileSync(this.getLogPath(), line + '\n')
  }

  info(module: string, message: string, meta?: Record<string, unknown>): void {
    this.write('INFO', module, message, meta)
  }

  error(module: string, message: string, meta?: Record<string, unknown>): void {
    this.write('ERROR', module, message, meta)
  }

  warn(module: string, message: string, meta?: Record<string, unknown>): void {
    this.write('WARN', module, message, meta)
  }
}

export const logger = new Logger()
