import {contextBridge, ipcRenderer} from "electron";
import {NowPlaying} from "./Music/Music";
import {PluginInfo} from "./functions/plugins";
import {Settings} from "./JSON/db";

contextBridge.exposeInMainWorld("electron", {
	handleService: async (service: "YouTube" | "Twitch" | "OBS", data: any) => {
		return await ipcRenderer.invoke("handleService", service, data);
	},
	createWindow: (type: string, settings?: any) => ipcRenderer.send("createWindow", type, settings),
	getMessage: (func: (messageData: any) => void) => {
		ipcRenderer.on("message", (_evt, messageData: any) => func(messageData));
	},
	sendID: async (id: string) => ipcRenderer.send("sendID", id),
	getID: (func: (id: string) => void) => {
		ipcRenderer.on("sendID", (_evt, id: string) => func(id));
	},
	UpdateSettings: (settings: any) => ipcRenderer.send("updateSettings", settings),
	sendSettings: (chatSettings: any) => ipcRenderer.send("chatSettings", chatSettings),
	getSettings: (func: (chatSettings: any) => void) => {
		ipcRenderer.on("chatSettings", (_evt, chatSettings: any) => func(chatSettings));
	},
	getSettingsAsync: async () => await ipcRenderer.invoke("getSettings"),
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
	startstop: (path: string | null, name: string) => ipcRenderer.send("startstop", path, name),
	updateGame: (func: (name: string) => void) => {
		ipcRenderer.on("updateGame", (_evt, name: string) => func(name));
	},

	getPlugins: (func: (plugins: string, settings: Settings) => void) => {
		ipcRenderer.on("sendPlugins", (_evt, plugins: string, settings: Settings) => func(plugins, settings));
	},
	handlePlugin: (func: string, info: string) => ipcRenderer.send("handlePlugin", func, info),
	loadPlugin: (func: (info: PluginInfo) => void) => {
		ipcRenderer.on("loadPlugin", (_evt, info: PluginInfo) => func(info));
	},
	unloadPlugin: (func: (info: PluginInfo) => void) => {
		ipcRenderer.on("unloadPlugin", (_evt, info: PluginInfo) => func(info));
	},

	subscription: (func: (User: string, Gifter?: string) => void) => {
		ipcRenderer.on("subscription", (_evt, User, Gifter) => func(User, Gifter));
	},
	test: (User: string, Gifter?: string) => ipcRenderer.send("test", User, Gifter),
	monitors: (func: (Monitors: string[]) => void) => {
		ipcRenderer.on("monitors", (_evt, monitors) => func(monitors));
	},
	getMusic: (func: (music: NowPlaying | "np") => void) => {
		ipcRenderer.on("getMusic", (_evt, music) => func(music));
	},
	requestMusic: () => ipcRenderer.send("requestMusic"),
	close: (settings: any) => ipcRenderer.send("close", settings),
	error: (func: (msg: string) => void) => ipcRenderer.on("error", (_ent, msg: string) => func(msg))
});