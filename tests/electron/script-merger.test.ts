import { describe, it, expect } from 'vitest'
import { detectConflicts, mergeScripts } from '../../src/main/modules/script-merger'

describe('Script Merger', () => {
  describe('detectConflicts', () => {
    it('detects conflict when two mods modify the same script', () => {
      const mods = [
        { id: 'modA', name: 'Mod A', modifiedScripts: ['game/player.ws', 'game/npc.ws'] },
        { id: 'modB', name: 'Mod B', modifiedScripts: ['game/player.ws', 'game/combat.ws'] },
      ]

      const conflicts = detectConflicts(mods)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].scriptPath).toBe('game/player.ws')
      expect(conflicts[0].involvedMods).toEqual(['modA', 'modB'])
      expect(conflicts[0].status).toBe('unresolved')
    })

    it('returns no conflicts when mods have no overlapping scripts', () => {
      const mods = [
        { id: 'modA', name: 'Mod A', modifiedScripts: ['game/player.ws'] },
        { id: 'modB', name: 'Mod B', modifiedScripts: ['game/combat.ws'] },
      ]

      const conflicts = detectConflicts(mods)
      expect(conflicts).toHaveLength(0)
    })

    it('detects conflict with three mods on the same script', () => {
      const mods = [
        { id: 'modA', name: 'Mod A', modifiedScripts: ['game/player.ws'] },
        { id: 'modB', name: 'Mod B', modifiedScripts: ['game/player.ws'] },
        { id: 'modC', name: 'Mod C', modifiedScripts: ['game/player.ws'] },
      ]

      const conflicts = detectConflicts(mods)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].involvedMods).toEqual(['modA', 'modB', 'modC'])
    })

    it('handles empty mod list', () => {
      const conflicts = detectConflicts([])
      expect(conflicts).toHaveLength(0)
    })

    it('handles mods with no scripts', () => {
      const mods = [
        { id: 'modA', name: 'Mod A', modifiedScripts: [] },
        { id: 'modB', name: 'Mod B', modifiedScripts: [] },
      ]

      const conflicts = detectConflicts(mods)
      expect(conflicts).toHaveLength(0)
    })
  })

  describe('mergeScripts', () => {
    it('auto-merges non-conflicting changes from two mods', () => {
      const vanilla = [
        'line 1',
        'line 2',
        'line 3',
        'line 4',
        'line 5',
      ].join('\n')

      // Mod A changes line 2
      const modA = [
        'line 1',
        'line 2 modified by A',
        'line 3',
        'line 4',
        'line 5',
      ].join('\n')

      // Mod B changes line 4
      const modB = [
        'line 1',
        'line 2',
        'line 3',
        'line 4 modified by B',
        'line 5',
      ].join('\n')

      const result = mergeScripts(vanilla, modA, modB)
      expect(result.success).toBe(true)
      expect(result.merged).toContain('line 2 modified by A')
      expect(result.merged).toContain('line 4 modified by B')
      expect(result.conflicts).toBeUndefined()
    })

    it('reports conflict when both mods change the same line', () => {
      const vanilla = [
        'line 1',
        'line 2',
        'line 3',
      ].join('\n')

      const modA = [
        'line 1',
        'line 2 changed by A',
        'line 3',
      ].join('\n')

      const modB = [
        'line 1',
        'line 2 changed by B',
        'line 3',
      ].join('\n')

      const result = mergeScripts(vanilla, modA, modB)
      expect(result.success).toBe(false)
      expect(result.conflicts).toBeDefined()
      expect(result.conflicts!.length).toBeGreaterThan(0)
      expect(result.merged).toContain('<<<<<<< Mod A')
      expect(result.merged).toContain('=======')
      expect(result.merged).toContain('>>>>>>> Mod B')
    })

    it('handles identical modifications from both mods', () => {
      const vanilla = [
        'line 1',
        'line 2',
        'line 3',
      ].join('\n')

      // Both mods make the same change
      const modA = [
        'line 1',
        'line 2 same change',
        'line 3',
      ].join('\n')

      const modB = [
        'line 1',
        'line 2 same change',
        'line 3',
      ].join('\n')

      const result = mergeScripts(vanilla, modA, modB)
      // diff3 with excludeFalseConflicts should auto-resolve identical changes
      expect(result.success).toBe(true)
      expect(result.merged).toContain('line 2 same change')
    })

    it('handles empty vanilla file', () => {
      const result = mergeScripts('', 'new line A', 'new line B')
      // Both mods add content to empty file - this will conflict
      expect(result).toBeDefined()
      expect(result.merged).toBeDefined()
    })
  })
})
