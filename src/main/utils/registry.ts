import { execFileSync } from 'child_process'

export function readRegistryValue(keyPath: string, valueName: string): string | null {
  try {
    const result = execFileSync('reg', ['query', keyPath, '/v', valueName], { encoding: 'utf-8' })
    const match = result.match(/REG_SZ\s+(.+)/)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}
