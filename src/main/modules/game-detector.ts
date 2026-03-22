import { join } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { readRegistryValue } from '../utils/registry'
import { logger } from './logger'

export interface GameInfo {
  gamePath: string
  gameVersion: 'nextgen' | 'classic'
  platform: 'steam' | 'gog' | 'epic' | 'manual'
}

export function parseLibraryFolders(vdfContent: string): string[] {
  const paths: string[] = []
  const pathRegex = /"path"\s+"([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = pathRegex.exec(vdfContent)) !== null) {
    paths.push(match[1].replace(/\\\\/g, '\\'))
  }
  return paths
}

export function findWitcherInLibrary(
  libraryPath: string,
  existsCheck: (p: string) => boolean = existsSync
): string | null {
  const gamePath = join(libraryPath, 'steamapps', 'common', 'The Witcher 3')
  if (
    existsCheck(join(gamePath, 'bin', 'x64', 'witcher3.exe')) ||
    existsCheck(join(gamePath, 'bin', 'x64_dx12', 'witcher3.exe'))
  ) {
    return gamePath
  }
  return null
}

export function detectGameVersion(gamePath: string): 'nextgen' | 'classic' {
  if (existsSync(join(gamePath, 'bin', 'x64_dx12'))) return 'nextgen'
  return 'classic'
}

function detectSteam(): GameInfo | null {
  logger.info('game-detector', 'Checking Steam...')
  const steamPath = readRegistryValue(
    'HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam',
    'InstallPath'
  )
  if (!steamPath) return null
  const vdfPath = join(steamPath, 'steamapps', 'libraryfolders.vdf')
  if (!existsSync(vdfPath)) return null
  const vdfContent = readFileSync(vdfPath, 'utf-8')
  const libraries = parseLibraryFolders(vdfContent)
  for (const lib of libraries) {
    const gamePath = findWitcherInLibrary(lib)
    if (gamePath) {
      return { gamePath, gameVersion: detectGameVersion(gamePath), platform: 'steam' }
    }
  }
  return null
}

function detectGOG(): GameInfo | null {
  logger.info('game-detector', 'Checking GOG...')
  const gogPath = readRegistryValue(
    'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1495134320',
    'path'
  )
  if (!gogPath || !existsSync(gogPath)) return null
  return { gamePath: gogPath, gameVersion: detectGameVersion(gogPath), platform: 'gog' }
}

function detectEpic(): GameInfo | null {
  logger.info('game-detector', 'Checking Epic...')
  const manifestDir = 'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests'
  if (!existsSync(manifestDir)) return null
  try {
    const files = readdirSync(manifestDir).filter((f) => f.endsWith('.item'))
    for (const file of files) {
      const content = readFileSync(join(manifestDir, file), 'utf-8')
      const manifest = JSON.parse(content)
      if (manifest.DisplayName?.includes('Witcher 3') && existsSync(manifest.InstallLocation)) {
        return {
          gamePath: manifest.InstallLocation,
          gameVersion: detectGameVersion(manifest.InstallLocation),
          platform: 'epic'
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function detectGame(): GameInfo | null {
  return detectSteam() || detectGOG() || detectEpic()
}
