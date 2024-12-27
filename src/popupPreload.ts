import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	sendCloseRequest: (windowId: string) => ipcRenderer.send('close-window', windowId),
	close: () => ipcRenderer.send("close")
});