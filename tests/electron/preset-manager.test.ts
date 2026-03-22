import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

import { PresetStore } from '../../src/main/modules/preset-manager'
import type { Preset, PresetMod } from '../../src/main/modules/preset-manager'

let tempDirs: string[] = []

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'w3preset-test-'))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true })
    } catch {
      /* ignore cleanup errors */
    }
  }
  tempDirs = []
})

function makeBuiltInFile(dir: string): string {
  const builtInPath = join(dir, 'default-presets.json')
  const builtIn: Preset[] = [
    {
      id: 'builtin_test',
      name: 'Test Built-in',
      description: 'A built-in preset',
      mods: [
        { name: 'Mod A', nexusUrl: 'https://nexusmods.com/witcher3/mods/1', loadOrder: 0 },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      isBuiltIn: true,
    },
  ]
  writeFileSync(builtInPath, JSON.stringify(builtIn))
  return builtInPath
}

describe('PresetStore', () => {
  it('returns built-in presets', () => {
    const dir = makeTempDir()
    const builtInPath = makeBuiltInFile(dir)
    const presetsDir = join(dir, 'custom')

    const store = new PresetStore(presetsDir, builtInPath)
    const all = store.getAll()

    expect(all).toHaveLength(1)
    expect(all[0].id).toBe('builtin_test')
    expect(all[0].isBuiltIn).toBe(true)
  })

  it('creates a custom preset and persists it', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'nonexistent.json'))

    const preset = store.create({
      name: 'My Preset',
      description: 'My custom preset',
      mods: [{ name: 'TestMod', loadOrder: 0 }],
    })

    expect(preset.name).toBe('My Preset')
    expect(preset.isBuiltIn).toBe(false)
    expect(preset.mods).toHaveLength(1)

    // Check persisted
    const filePath = join(presetsDir, `${preset.id}.json`)
    expect(existsSync(filePath)).toBe(true)
  })

  it('getAll returns both built-in and custom presets', () => {
    const dir = makeTempDir()
    const builtInPath = makeBuiltInFile(dir)
    const presetsDir = join(dir, 'custom')

    const store = new PresetStore(presetsDir, builtInPath)
    store.create({ name: 'Custom 1', description: '', mods: [] })
    store.create({ name: 'Custom 2', description: '', mods: [] })

    const all = store.getAll()
    expect(all).toHaveLength(3) // 1 built-in + 2 custom
  })

  it('removes a custom preset', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    const preset = store.create({ name: 'To Delete', description: '', mods: [] })
    expect(store.getAll()).toHaveLength(1)

    store.remove(preset.id)
    expect(store.getAll()).toHaveLength(0)
  })

  it('throws when removing nonexistent preset', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    expect(() => store.remove('nonexistent')).toThrow('Preset not found')
  })

  it('exports a preset as JSON string', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    const preset = store.create({
      name: 'Export Me',
      description: 'For export',
      mods: [{ name: 'Mod X', loadOrder: 0, nexusUrl: 'https://example.com' }],
    })

    const exported = store.export(preset.id)
    const parsed = JSON.parse(exported)

    expect(parsed.name).toBe('Export Me')
    expect(parsed.mods).toHaveLength(1)
    expect(parsed.isBuiltIn).toBe(false)
  })

  it('imports a preset from JSON string', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    const jsonString = JSON.stringify({
      name: 'Imported Preset',
      description: 'From another user',
      mods: [
        { name: 'ModA', loadOrder: 0 },
        { name: 'ModB', loadOrder: 1 },
      ],
    })

    const imported = store.import(jsonString)

    expect(imported.name).toBe('Imported Preset')
    expect(imported.mods).toHaveLength(2)
    expect(imported.isBuiltIn).toBe(false)

    // Should appear in getAll
    const all = store.getAll()
    expect(all).toHaveLength(1)
  })

  it('throws on importing invalid JSON', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    expect(() => store.import('not valid json')).toThrow()
  })

  it('throws on importing data missing required fields', () => {
    const dir = makeTempDir()
    const presetsDir = join(dir, 'custom')
    const store = new PresetStore(presetsDir, join(dir, 'none.json'))

    expect(() => store.import(JSON.stringify({ description: 'no name or mods' }))).toThrow(
      'Invalid preset format'
    )
  })
})
