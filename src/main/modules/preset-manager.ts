import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs'
import { join } from 'path'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PresetMod {
  name: string
  nexusUrl?: string
  loadOrder: number
  notes?: string
}

export interface Preset {
  id: string
  name: string
  description: string
  mods: PresetMod[]
  createdAt: string
  isBuiltIn: boolean
}

// ─── PresetStore ────────────────────────────────────────────────────────────

export class PresetStore {
  private presetsDir: string
  private builtInPath: string

  constructor(presetsDir: string, builtInPath: string) {
    this.presetsDir = presetsDir
    this.builtInPath = builtInPath

    if (!existsSync(this.presetsDir)) {
      mkdirSync(this.presetsDir, { recursive: true })
    }
  }

  /** Return all built-in and custom presets */
  getAll(): Preset[] {
    const builtIn = this.loadBuiltIn()
    const custom = this.loadCustom()
    return [...builtIn, ...custom]
  }

  /** Create a new custom preset and persist it to disk */
  create(data: { name: string; description: string; mods: PresetMod[] }): Preset {
    const id = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const preset: Preset = {
      id,
      name: data.name,
      description: data.description,
      mods: data.mods,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
    }

    const filePath = join(this.presetsDir, `${id}.json`)
    writeFileSync(filePath, JSON.stringify(preset, null, 2))
    return preset
  }

  /** Remove a custom preset by id */
  remove(id: string): void {
    const filePath = join(this.presetsDir, `${id}.json`)
    if (existsSync(filePath)) {
      rmSync(filePath)
    } else {
      throw new Error(`Preset not found: ${id}`)
    }
  }

  /** Export a preset as a JSON string */
  export(id: string): string {
    const all = this.getAll()
    const preset = all.find((p) => p.id === id)
    if (!preset) throw new Error(`Preset not found: ${id}`)

    // When exporting, strip isBuiltIn so it can be imported as custom
    const exportData = { ...preset, isBuiltIn: false }
    return JSON.stringify(exportData, null, 2)
  }

  /** Import a preset from a JSON string */
  import(jsonString: string): Preset {
    const parsed = JSON.parse(jsonString)

    if (!parsed.name || !Array.isArray(parsed.mods)) {
      throw new Error('Invalid preset format: must have name and mods array')
    }

    const preset = this.create({
      name: parsed.name,
      description: parsed.description ?? '',
      mods: parsed.mods,
    })

    return preset
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private loadBuiltIn(): Preset[] {
    try {
      if (!existsSync(this.builtInPath)) return []
      const raw = readFileSync(this.builtInPath, 'utf-8')
      const data = JSON.parse(raw)
      if (!Array.isArray(data)) return []
      return data.map((p: Preset) => ({ ...p, isBuiltIn: true }))
    } catch {
      return []
    }
  }

  private loadCustom(): Preset[] {
    try {
      if (!existsSync(this.presetsDir)) return []
      const files = readdirSync(this.presetsDir).filter((f) => f.endsWith('.json'))
      const presets: Preset[] = []

      for (const file of files) {
        try {
          const raw = readFileSync(join(this.presetsDir, file), 'utf-8')
          const preset = JSON.parse(raw) as Preset
          preset.isBuiltIn = false
          presets.push(preset)
        } catch {
          // Skip invalid preset files
        }
      }

      return presets
    } catch {
      return []
    }
  }
}
