// import {
// 	Chat,
// 	filterWithoutEmojis,
// 	newPopup,
// 	Command,
// 	Game, deleteSources
// } from "./functions";
// import settings from "./settings.json";
// import { LiveChat } from "youtube-chat";
// import { EmojiItem } from "youtube-chat/dist/types/data";
// import {Client} from "tmi.js";
// import {OBSWebSocket} from "obs-websocket-js";
import {app, BrowserWindow, ipcMain} from "electron";
import {getData, updateData} from "./JSON/db";
import path from "path";
import {OBS, serviceData, ServiceManager, serviceNames, servicesTypes, Twitch, YouTube} from "./Services";
import * as fs from "node:fs";
import {TTS} from "./functions";
import {runTwitch, runYouTube} from './ChatService';



const extensions = [".ts", ".js"];
let window: BrowserWindow;
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
		const cmdPath = path.join(__dirname, "games");
		const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		});
		const pluginPath = path.join(__dirname, "..", "frontend", "plugins");
		const pluginFiles = fs.readdirSync(pluginPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		})
		
		win.webContents.send("inputs", await new TTS(1).listAudioDevices());
		win.webContents.send("gameList", cmdFiles.map((v) => {
			return {Path: path.join(cmdPath, v), Name: v};
		}));
		win.webContents.send("pluginsUpdated", pluginFiles);
		win.webContents.send("chatSettingsFM", await getData());
		win.show();
	});

	window = win;

	// if (settings.useChat) {
	// 	const pluginPath = path.join(__dirname, "..", "frontend", "plugins");
	// 	const pluginFiles = readdirSync(pluginPath).filter(file => file.endsWith(".js"));
	// 	win.webContents.executeJavaScript(`
	// 		enabledPlugins = "${settings.enabledPlugins}".split(",");
	// 		plugins = "${settings.disabledPlugins}".split(",");
	// 	`);
	// 	for (const file of pluginFiles) {
	// 		win.webContents.executeJavaScript(`(() => {
	// 			if (enabledPlugins.includes("./plugins/${file}")) return;
	// 			plugins.push("./plugins/${file}");
	// 		})(); loadPlugins();`);
	// 	}
	// 	win.loadFile("../frontend/chat/index.html");
	// }
});

export const services = new ServiceManager();
services.addService("Twitch", new Twitch());
services.addService("YouTube", new YouTube());
services.addService("OBS", new OBS());

// TODO: Fix all these ipcMain calls.
// ! NOTE: turn all calls into a class?
//          Figure out how to make listeners work in the class, without specific calls to make sure they're active.
//          I don't know, something to figure out, when I get to it.
ipcMain.handle("handleService", async <T extends serviceNames>(_Event: any, Service: T, Data: string[]) => {
	let data: serviceData[T];
	switch (Service) {
		case "YouTube":
		case "Twitch":
			data = {Channel: Data[0]} as serviceData[T];
			break;
		case "OBS":
			const [PortStr, Password] = Data;
			const Port = parseInt(PortStr);
			if (isNaN(Port)) {
				console.error(new Error("Port must be a valid number."));
				return {success: false};
			}
			data = {Port: Port.toString(), Password} as serviceData[T];
			break;
		default:
			console.error(new Error("Unknown service type."));
			return {success: false};
	}

	if (Object.values(data).some(value => value === '' || value == null)) {
		return {success: false};
	}

	try {
		if (services.getService(Service)?.connected) {
			const connectionResult = await services.disconnectService(Service);
			if (connectionResult.success) {
				return {success: true};
			} else {
				return {success: false};
			}
		}

		const connectionResult = await services.connectService(Service, data as serviceData[T]);
		if (connectionResult.success) {
			return {success: true};
		} else {
			return {success: false};
		}
	} catch (err) {
		console.log(err);
		return {success: false};
	}
});
let ChatWindow: BrowserWindow | null;
ipcMain.on("createWindow", async (_evt, type: string, settings: any) => {
	const mainBounds = window.getBounds();
	const x = Math.round(mainBounds.x + (mainBounds.width - 400) / 2);
	const y = Math.round(mainBounds.y + (mainBounds.height - 575) / 2);
	const newWindow = new BrowserWindow({
		width: 400,
		height: 575,
		resizable: false,
		show: false,
		x,
		y,
		frame: false,
		roundedCorners: false,
		transparent: true,
		maximizable: false,
		webPreferences: {
			preload: path.join(__dirname, "controlpanel.js")
		}
	});

	switch (type) {
		case "chatSettings":
			const settingsWindow = BrowserWindow.getAllWindows().find((window) => window.title == "ChatPlays - Chat Settings");
			if (settingsWindow) {
				newWindow.close();
				settingsWindow.setPosition(x, y, true);
				return settingsWindow.focus();
			}
			newWindow.title = "ChatPlays - Chat Settings";
			await newWindow.loadFile("../frontend/chatSettings.html");
			newWindow.on("ready-to-show", async () => {
				newWindow.webContents.send("themes", fs.readdirSync(path.join(__dirname, "..", "frontend", "Chat", "themes")));
				newWindow.webContents.send("chatSettingsFM", await getData());
			});
			newWindow.show();
			break;
		case "chatWindow":
			if (ChatWindow != null) {
				newWindow.close();
				ChatWindow.close();
				return ChatWindow = null;
			}
			newWindow.setSize(parseInt(settings.chatWidth), parseInt(settings.chatHeight));
			newWindow.title = "ChatPlays - Chat";
			await newWindow.loadFile(`../frontend/Chat/index.html`);
			newWindow.on("ready-to-show", async () => {
				newWindow.webContents.send("chatSettingsFM", await getData());
			});
			newWindow.show();
			ChatWindow = newWindow;
			break;
	}
});
ipcMain.on("chatSettings", async (_evt, settings: any) => {
	const data = await getData();
	for (const key in settings) {
		if (data[key] !== settings[key]) {
			data[key] = settings[key];
		}
	}
	if (ChatWindow)
		ChatWindow.webContents.send("chatSettings", data);
	window.webContents.send("chatSettings", data);
	return await updateData(data);
});
ipcMain.on("updateSettings", async (_evt, settings: any) => {
	const data = await getData();
	for (const key in settings) {
		if (data[key] !== settings[key]) {
			data[key] = settings[key];
			if (key == "brb" && ChatWindow)
				ChatWindow.webContents.send("chatSettings", data);
		}
	}
	return await updateData(data);
});
ipcMain.on("sendID", (_evt, id: string, name: string) => {
	if (ChatWindow)
		ChatWindow.webContents.send("sendID", id, name);
	window.webContents.send("sendID", id, name);
});
ipcMain.on("startstop", async (_ent, p: string | null, name: string) => {
	const settings = await getData();
	if (!p) {
		if (ChatWindow) {
			ChatWindow.webContents.send("updateGame", "");
		}
		settings["ChatPlaysActive"] = false;
	} else if (fs.existsSync(p)) {
		if (ChatWindow) {
			ChatWindow.webContents.send("updateGame", name);
		}
		settings["gamePath"] = p;
		settings["ChatPlaysActive"] = true;
	}
	await updateData(settings);
});

fs.watch(path.join(__dirname, "..", "frontend", "plugins"), (eventType, filename) => {
	if (!filename || eventType != "rename") return;
	window.webContents.send(
		"pluginsUpdated",
		fs.readdirSync(
			path.join(__dirname, "..", "frontend", "plugins")
		).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		})
	);
});
ipcMain.on("handlePlugin", async (_evt, method: "load" | "unload", plugin: string) => {
	if (!ChatWindow) return;
	if (method == "load") {
		ChatWindow.webContents.send("loadPlugin", plugin);
	} else {
		ChatWindow.webContents.send("unloadPlugin", plugin);
	}
});
ipcMain.on("test", async (_evt, User: string, Gifter: string) => {
	const service = services.getService("OBS");
	if (!service || !service.connected) return;
	
	await service.newPopup("TestSub", User, Gifter);
});
ipcMain.on("closepopup", async (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;
	const obs = services.getService("OBS");
	if (obs && obs.connected) {
		await obs.deleteSource(win.title);
		win.close();
	}
});
ipcMain.on("close", async (_event, settings: any) => {
	try {
		const prevSettings = await getData();
		for (const key of Object.keys(settings)) {
			if (prevSettings[key] != key) {
				prevSettings[key] = settings[key];
			}
		}
		await updateData(prevSettings);

		const obs = services.getService("OBS");
		if (obs && obs.connected)
			await obs.deleteSources();
		
		for (let window of BrowserWindow.getAllWindows()) {
			window.close();
		}

		for (let service of services.getServices()) {
			await services.disconnectService(service);
		}
	} catch (e) {
		console.error(e);
	}
});
app.on("window-all-closed", async () => {
	return app.quit();
});

const handlers: {
	[T in serviceNames]: (service: servicesTypes[T]) => Promise<void>;
} = {
	Twitch: runTwitch,
	YouTube: runYouTube,
	OBS: async () => {
		console.log("OBS Connected");
	}
}
services.on("ServiceConnected", async function<T extends serviceNames>(name: T, service: servicesTypes[T])  {
	return await handlers[name](service);	
});