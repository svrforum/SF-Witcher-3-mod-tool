import { diff3Merge } from 'node-diff3'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConflictInput {
  id: string
  name: string
  modifiedScripts: string[]
}

export interface ScriptConflict {
  scriptPath: string
  involvedMods: string[]
  status: 'unresolved' | 'auto_merged' | 'manual_merged'
  mergedFilePath?: string
}

export interface MergeResult {
  success: boolean
  merged?: string
  conflicts?: Array<{ aContent: string; bContent: string; oContent: string }>
}

// ─── Conflict Detection ──────────────────────────────────────────────────────

/**
 * Detect script conflicts between mods.
 * A conflict occurs when two or more mods modify the same .ws script.
 */
export function detectConflicts(mods: ConflictInput[]): ScriptConflict[] {
  const scriptToMods = new Map<string, string[]>()

  for (const mod of mods) {
    for (const script of mod.modifiedScripts) {
      const existing = scriptToMods.get(script) || []
      existing.push(mod.id)
      scriptToMods.set(script, existing)
    }
  }

  const conflicts: ScriptConflict[] = []
  for (const [scriptPath, modIds] of scriptToMods) {
    if (modIds.length > 1) {
      conflicts.push({ scriptPath, involvedMods: modIds, status: 'unresolved' })
    }
  }

  return conflicts
}

// ─── Three-Way Merge ─────────────────────────────────────────────────────────

/**
 * Perform a three-way merge of two mod versions against a vanilla base.
 * Uses diff3Merge from node-diff3.
 *
 * @param vanilla - The original (vanilla) script content
 * @param modA - Script content modified by Mod A
 * @param modB - Script content modified by Mod B
 * @returns MergeResult with merged content and conflict details
 */
export function mergeScripts(vanilla: string, modA: string, modB: string): MergeResult {
  const vanillaLines = vanilla.split('\n')
  const aLines = modA.split('\n')
  const bLines = modB.split('\n')

  const result = diff3Merge(aLines, vanillaLines, bLines)

  let hasConflict = false
  const mergedLines: string[] = []
  const conflictDetails: Array<{ aContent: string; bContent: string; oContent: string }> = []

  for (const hunk of result) {
    if ('ok' in hunk) {
      mergedLines.push(...hunk.ok)
    } else if ('conflict' in hunk) {
      hasConflict = true
      conflictDetails.push({
        aContent: hunk.conflict.a.join('\n'),
        bContent: hunk.conflict.b.join('\n'),
        oContent: (hunk.conflict.o || []).join('\n'),
      })
      mergedLines.push('<<<<<<< Mod A')
      mergedLines.push(...hunk.conflict.a)
      mergedLines.push('=======')
      mergedLines.push(...hunk.conflict.b)
      mergedLines.push('>>>>>>> Mod B')
    }
  }

  if (hasConflict) {
    return { success: false, merged: mergedLines.join('\n'), conflicts: conflictDetails }
  }

  return { success: true, merged: mergedLines.join('\n') }
}
