﻿import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("electron", {
	handleService: async (service: "YouTube" | "Twitch" | "OBS", data: any) => {
		return await ipcRenderer.invoke("handleService", service, data);
	},
	createWindow: (type: string, settings?: any) => ipcRenderer.send("createWindow", type, settings),
	getMessage: (func: (messageData: any) => void) => {
		ipcRenderer.on("message", (_evt, messageData: any) => func(messageData));
	},
	sendID: async (id: string, name: string) => {
		ipcRenderer.send("sendID", id, name);
	},
	getID: (func: (id: any, name: string) => void) => {
		ipcRenderer.on("sendID", (_evt, id: string, name: string) => func(id, name));
	},
	UpdateSettings: (settings: any) => {
		ipcRenderer.send("updateSettings", settings);
	},
	sendSettings: (chatSettings: any) => {
		ipcRenderer.send("chatSettings", chatSettings);
	},
	getSettings: (func: (chatSettings: any) => void) => {
		ipcRenderer.on("chatSettings", (_evt, chatSettings: any) => func(chatSettings));
	},
	settingsOnLoad: (func: (chatSettings: any) => void) => {
		ipcRenderer.on("chatSettingsFM", (_evt, chatSettings: any) => func(chatSettings));
	},
	getThemes: (func: (themes: string[]) => void) => {
		ipcRenderer.on("themes", (_evt, themes: string[]) => func(themes));
	},
	getAudioInputs: (func: (inputs: string[]) => void) => {
		ipcRenderer.on("inputs", (_evt, inputs: string[]) => {func(inputs)});
	},
	getGameList: (func: (gameList: {Path: string, Name: string}) => void) => {
		ipcRenderer.on("gameList", (_evt, gameList) => {func(gameList)});
	},
	startstop: (path: string | null, name: string) => {
		ipcRenderer.send("startstop", path, name);
	},
	updateGame: (func: (name: string) => void) => {
		ipcRenderer.on("updateGame", (_evt, name: string) => func(name));
	},
	handlePlugin: (method: "load" | "unload", plugin: string) => {
		ipcRenderer.send("handlePlugin", method, plugin);
	},
	plugins: (func: (plugins: string[]) => void) => {
		ipcRenderer.on("plugins", (_evt, plugins) => func(plugins));
	},
	loadPlugin: (func: (plugin: string) => void) => {
		ipcRenderer.on("loadPlugin", (_evt, plugin) => func(plugin));
	},
	unloadPlugin: (func: (plugin: string) => void) => {
		ipcRenderer.on("unloadPlugin", (_evt, plugin) => func(plugin));
	},
	pluginsUpdated: (func: (plugins: string[]) => void) => {
		ipcRenderer.on("pluginsUpdated", (_evt, plugins) => func(plugins));
	},
	subscription: (func: (User: any, Gifter?: any) => void) => {
		ipcRenderer.on("subscription", (_evt, User, Gifter) => func(User, Gifter));
	},
	test: (User: string, Gifter?: string) => {
		ipcRenderer.send("test", User, Gifter);
	},
	monitors: (func: (Monitors: string[]) => void) => {
		ipcRenderer.on("monitors", (_evt, monitors) => func(monitors));
	},
	close: (settings: any) => ipcRenderer.send("close", settings),
	error: (func: (msg: string) => void) => ipcRenderer.on("error", (_ent, msg: string) => func(msg))
});