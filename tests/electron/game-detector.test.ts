import { describe, it, expect, vi } from 'vitest'
import { join } from 'path'

vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/test-app-data'
  }
}))

import { parseLibraryFolders, findWitcherInLibrary } from '../../src/main/modules/game-detector'

describe('parseLibraryFolders', () => {
  it('parses Steam libraryfolders.vdf format', () => {
    const vdf = `
"libraryfolders"
{
  "0"
  {
    "path"    "C:\\\\Program Files (x86)\\\\Steam"
    "apps"
    {
      "292030"    "0"
    }
  }
  "1"
  {
    "path"    "D:\\\\SteamLibrary"
    "apps"
    {
      "292030"    "0"
    }
  }
}`
    const folders = parseLibraryFolders(vdf)
    expect(folders).toEqual([
      'C:\\Program Files (x86)\\Steam',
      'D:\\SteamLibrary',
    ])
  })
})

describe('findWitcherInLibrary', () => {
  it('returns path when witcher3.exe exists', () => {
    const mockExistsSync = vi.fn((p: string) =>
      p.includes('The Witcher 3') && p.includes('witcher3.exe')
    )
    const result = findWitcherInLibrary('D:\\SteamLibrary', mockExistsSync)
    expect(result).toBe(join('D:\\SteamLibrary', 'steamapps', 'common', 'The Witcher 3'))
  })

  it('returns null when game not found', () => {
    const mockExistsSync = vi.fn(() => false)
    const result = findWitcherInLibrary('D:\\SteamLibrary', mockExistsSync)
    expect(result).toBeNull()
  })
})
