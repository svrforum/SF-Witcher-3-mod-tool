import { ipcMain, BrowserWindow, dialog } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { detectGame, detectGameVersion } from './modules/game-detector'
import type { GameInfo } from './modules/game-detector'

export function registerIpcHandlers(_mainWindow: BrowserWindow): void {
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })
  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('game:detect', async (): Promise<GameInfo | null> => {
    return detectGame()
  })

  ipcMain.handle('game:select-manual', async (event): Promise<GameInfo | null> => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      title: 'Select Witcher 3 Installation Folder',
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const gamePath = result.filePaths[0]
    const hasExe =
      existsSync(join(gamePath, 'bin', 'x64', 'witcher3.exe')) ||
      existsSync(join(gamePath, 'bin', 'x64_dx12', 'witcher3.exe'))

    if (!hasExe) return null

    return {
      gamePath,
      gameVersion: detectGameVersion(gamePath),
      platform: 'manual'
    }
  })
}
