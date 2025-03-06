import {app, BrowserWindow} from "electron";
import {getData} from "./JSON/db";
import path from "path";
import {OBS, ServiceManager, serviceNames, servicesTypes, Twitch, YouTube} from "./Services";
import * as fs from "node:fs";
import {ipcManager, TTS} from "./functions";
import {runTwitch, runYouTube} from './ChatService';

// * Electron
app.setAppUserModelId("ChatPlays");
app.whenReady().then(async () => {
	const win = new BrowserWindow({
		title: "ChatPlays - Control Panel",
		width: 800,
		height: 850,
		frame: false,
		roundedCorners: false,
		show: false,
		maximizable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "controlpanel.js"),
			contextIsolation: true
		}
	});
	win.loadFile("../frontend/controlpanel.html");
	win.on('ready-to-show', async () => {
		const extensions = [".ts", ".js"];
		const cmdPath = path.join(__dirname, "games");
		const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		});
		const pluginPath = path.join(__dirname, "..", "frontend", "plugins");
		const pluginFiles = fs.readdirSync(pluginPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		});
		
		win.webContents.send("inputs", await new TTS(1).listAudioDevices());
		win.webContents.send("gameList", cmdFiles.map((v) => {
			return {Path: path.join(cmdPath, v), Name: v};
		}));
		win.webContents.send("pluginsUpdated", pluginFiles);
		win.webContents.send("chatSettingsFM", await getData());
		win.show();
	});

	return new ipcManager(win);
});

export const services = new ServiceManager();
services.addService("Twitch", new Twitch());
services.addService("YouTube", new YouTube());
services.addService("OBS", new OBS());

app.on("window-all-closed", async () => {
	return app.quit();
});

const handlers: {
	[T in serviceNames]: (service: servicesTypes[T]) => Promise<void>;
} = {
	Twitch: runTwitch,
	YouTube: runYouTube,
	OBS: async () => {}
}
services.on("ServiceConnected", async function<T extends serviceNames>(name: T, service: servicesTypes[T])  {
	return await handlers[name](service);	
});