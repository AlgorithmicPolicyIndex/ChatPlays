﻿import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	update: (func: (user: string, gifter?: string) => void) => {
		ipcRenderer.on("UpdateText", (_evt, user, gifter?) => {
			func(user, gifter);
		});	
	},
	close: () => ipcRenderer.send("closepopup")
});