import {screen, BrowserWindow, ipcMain} from "electron";
import {getData, updateData} from "../JSON/db";
import {services} from '../index';
import path from "path";
import {existsSync, readdirSync, watch} from "node:fs";
import * as fs from 'node:fs';
import {musicRequest} from "../Music/Music";
import { Worker } from "worker_threads";
import {PythonShell} from "python-shell";
import ffmpeg from "fluent-ffmpeg"
import * as os from "node:os";
import {serviceData, serviceNames} from "../Services";
import { Plugins } from "./plugins";

type windowType = "chatWindow" | "chatSettings" | "musicWindow" | "pluginWindow";
let worker: Worker | null = null;
export class ipcManager {
	private windows: Partial<Record<windowType, BrowserWindow>> = {};
	private Thumbnail: string | null = null;
	private mainWindow: BrowserWindow;
	private Plugins: Plugins = new Plugins();

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
		this.registerHandlers();
	}

	registerHandlers() {
		ipcMain.on("createWindow", this.createWindow.bind(this));
		ipcMain.handle("handleService", this.handleService.bind(this));
		ipcMain.on("chatSettings", this.updateSettings.bind(this));
		ipcMain.on("updateSettings", this.updateSettings.bind(this));
		ipcMain.on("requestMusic", this.MusicRequest.bind(this));
		ipcMain.on("sendId", this.sendID.bind(this));
		ipcMain.on("startstop", this.startstop.bind(this));
		ipcMain.on("handlePlugin", this.handlePlugin.bind(this));
		ipcMain.on("test", this.test.bind(this));
		ipcMain.on("closepopup", this.closePopup.bind(this));
		ipcMain.on("close", this.close.bind(this));
		ipcMain.handle("getSettings", async () => await getData());

		watch(path.resolve(__dirname, "..", "..", "plugins"), (_eventType, filename) => {
			if (!filename) return;
			this.mainWindow.webContents.send(
				"pluginsUpdated",
				readdirSync(
					path.resolve(__dirname, "..", "..", "plugins")
				).filter(file => {
					return [".js", ".ts"].some(ex => file.endsWith(ex));
				})
			);
		});
	}

	async handleService<T extends serviceNames>(_evt: any, Service: T, Data: string[]) {
		let data: serviceData[T];
		switch (Service) {
			case "OBS":
				const [Port, Password] = Data;
				if (isNaN(parseInt(Port))) {
					console.error(new Error("Port must be a valid number."));
					return {success: false};
				}
				data = {Port, Password} as serviceData[T];
				break;
			case "YouTube":
			case "Twitch":
				data = {Channel: Data[0]} as serviceData[T];
				break;
			default:
				console.error(new Error("Unknown Service Type."));
				return {success: false};
		}

		if (Object.values(data).some(v => !v)) {
			return {success: false};
		}

		try {
			if (services.getService(Service)?.connected) {
				if ((await services.disconnectService(Service)).success)
					return {success: true};
				return {success: false};
			}

			if ((await services.connectService(Service, data as serviceData[T])).success)
				return {success: true};
			return {success: false};
		} catch (e) {
			console.error(e);
			return {success: false};
		}
	}
	async updateSettings(_evt: any, settings: any) {
		const obs = services.getService("OBS");
		if (obs?.connected && settings.brb == true) {
			await obs.client.call("SetSceneItemEnabled", {
				sceneUuid: '6de75b7b-bf01-4213-b230-e922b2dbc0bd',
				sceneItemId:  16,
				sceneItemEnabled: true,
			});
		} else if (obs?.connected && settings.brb == false) {
			await obs.client.call("SetSceneItemEnabled", {
				sceneUuid: '6de75b7b-bf01-4213-b230-e922b2dbc0bd',
				sceneItemId:  16,
				sceneItemEnabled: false,
			});
		}
		const data = await getData();

		if (settings.theme !== data.theme) {
			const music = this.windows["musicWindow"];
			const [w, h] = settings.theme === "winxp" ? [550, 240] : [600, 200];
			if (music) {
				music.setResizable(true);
				music.setSize(w, h);
				music.setResizable(false)
				await music.loadFile(path.resolve(__dirname, "..", "..", "frontend", "Chat", "themes", settings.theme, "music.html"));
			}
		}

		Object.assign(data, settings);
		Object.values(this.windows).forEach((win) => {
			if (win.isDestroyed()) return;
			win.webContents.send("chatSettings", data);
		});
		this.mainWindow.webContents.send("chatSettings", data);
		return await updateData(data);
	}
	async sendID(_evt: any, id: string, name: string) {
		if (this.windows["chatWindow"])
			this.windows["chatWindow"].webContents.send("sendID", id, name);
		this.mainWindow.webContents.send("sendID", id, name);
	}
	async handlePlugin(_evt: any, func: string, info: any) {
		const type = info.type === "chat" ? this.windows["chatWindow"]
			: info.type === "application" || info.type === "service" ? this.mainWindow : this.windows["musicWindow"];
		const settings = await getData();

		switch (func) {
			case "enable":
			// TODO: Use settings to enable and disable plugins, just in case a window isn't opened.
			const plugin = settings.Plugins.Disabled.find((plugin) => plugin.name == info.name);
			if (!plugin) throw new Error(`Unknown plugin "${info.name}" at ${info.pathName}`);



			this.Plugins.enable(info, type!);
			break;
		// case "disable":
		// 	this.Plugins.disable(info, type);
		// 	break;
		// case "configure":
		// 	this.Plugins.configure(info);
		// 	break;
		}
	}
	async closePopup(event: any) {
		const win = BrowserWindow.fromWebContents(event.sender);
		const obs = services.getService("OBS");
		if (!win || !obs || !obs.connected) return;
		await obs.deleteSource(win.title);
		win.close();
	}
	async close(_evt: any, settings: any) {
		try {
			fs.rm(path.join(os.tmpdir(), "ChatPlays"), {recursive: true, force: true}, (err) => {
				if (err) throw err;
			});

			const data = await getData();
			Object.assign(data, settings);
			await updateData(data);

			const obs = services.getService("OBS");
			if (obs && obs.connected)
				await obs.deleteSources();
			for (let window of BrowserWindow.getAllWindows())
				window.close();
			for (let service of services.getServices())
				await services.disconnectService(service);
		} catch (e) {
			console.error(e);
		}
	}
	async test(_evt: any, User: string, Gifter: string) {
		const obs = services.getService("OBS");
		if (!obs || !obs.connected) return;
		await obs.newPopup("TestSub", User, Gifter);
	}
	async startstop(_evt: any, path: string | null, name: string) {
		const settings = await getData();
		const win = this.windows["chatWindow"];
		if (!path) {
			if (win)
				win.webContents.send("updateGame", "");
			settings["ChatPlaysActive"] = false;
		} else if (existsSync(path)) {
			if (win)
				win.webContents.send("updateGame", name);
			settings["gamePath"] = path;
			settings["ChatPlaysActive"] = true;
		}
		await updateData(settings);
	}
	async MusicRequest() {
		const musicWindow = this.windows["musicWindow"];
		if (!musicWindow) return;

		try {
			if (process.platform === "linux") {
				const data = await musicRequest();
				if (data == "np") return musicWindow.webContents.send("getMusic", "np");
				musicWindow.webContents.send("getMusic", data);
			} else {
				if (!(await getData()).usePython) return fetchMedia(musicWindow);

				await PythonShell.run(path.join(__dirname, "..", "python", "music.py"), {
					pythonPath: "python",
					pythonOptions: ["-u"],
					encoding: "utf-8",
				}).then((data: string[]) => {
					if (data[0] === "np")
						return musicWindow?.webContents.send("getMusic", "np");

					const parsed = JSON.parse(data[0]);
					if (parsed.Thumbnail) {
						if (this.Thumbnail === null) this.Thumbnail = parsed.Thumbnail;
						if (this.Thumbnail !== parsed.Thumbnail) {
							fs.rm(this.Thumbnail as string, () => {return;});
							this.Thumbnail = parsed.Thumbnail;
						}
					}

					musicWindow?.webContents.send("getMusic", parsed);
				});
			}
		} catch (e) {
			console.error("Music Request Died", e);
		}
	}
	async createWindow(_evt: any, type: windowType) {
		const settings = await getData();
		const mainBounds = this.mainWindow.getBounds();
		const [x, y] = [
			Math.round(mainBounds.x + (mainBounds.width - 400) / 2),
			Math.round(mainBounds.y + (mainBounds.height - 575) / 2)
		];
		const newWindow = new BrowserWindow({
			width: 400, height: 575,
			x, y, show: false, frame: false,
			roundedCorners: false,
			transparent: true,
			maximizable: false,
			useContentSize: true,
			webPreferences: {
				preload: path.join(__dirname, "..", "controlpanel.js")
			}
		});
		const window = this.windows[type];

		switch (type) {
		case "chatSettings":
			// Precaution for chatSettings
			if (window?.isDestroyed()) {
				delete this.windows[type];
			} else if (window) {
				newWindow.close();
				window.setPosition(x, y);
				window.focus();
				return;
			}

			newWindow.title = "ChatPlays - Chat Settings";
			newWindow.setResizable(false);
			await newWindow.loadFile(path.resolve(__dirname, "..", "..", "frontend", "chatSettings.html"));
			newWindow.on("ready-to-show", function() {
				newWindow.webContents.send("chatSettings", settings);
				newWindow.webContents.send("themes", readdirSync(path.join(__dirname, "..", "..", "frontend", "Chat", "themes")));
				newWindow.webContents.send("monitors", screen.getAllDisplays().map((display) => display.label));
			});
			newWindow.show();
			break;
		case "chatWindow":
			if (window) {
				newWindow.close();
				window.close();
				delete this.windows[type];
				return;
			}
			newWindow.setSize(parseInt(settings.chatWidth), parseInt(settings.chatHeight));
			newWindow.setResizable(false);
			newWindow.title = "ChatPlays - Chat";
			await newWindow.loadFile(path.resolve(__dirname, "..", "..", "frontend", "Chat", "index.html"));
			newWindow.on("ready-to-show", function() { newWindow.webContents.send("chatSettings", settings); });
			newWindow.show();
			break;
		case "musicWindow":
			if (window) {
				newWindow.close();
				window.close();
				delete this.windows[type];
				worker?.terminate();
				worker = null;
				return;
			}


			newWindow.title = "ChatPlays - Music";
			await newWindow.loadFile(path.resolve(__dirname, "..", "..", "frontend", "Chat", "themes", settings.theme, "music.html"));

			const [w, h] = settings.theme === "winxp" ? [550, 240] : [600, 200];
			newWindow.setSize(w, h);
			newWindow.setBounds({ x, y, width: w, height: h });
			newWindow.setResizable(false);

			newWindow.once("ready-to-show", async function() {
				newWindow.webContents.send("chatSettings", settings);
			});

			await delay(1000);
			newWindow.show();
			break;
		case "pluginWindow":
			if (window) {
				newWindow.close();
				window.setPosition(x, y);
				window.focus();
				return;
			}

			newWindow.title = "ChatPlays - Plugins";
			// TODO: Form window to content size until maximum size, to prevent going off screen.
			newWindow.setSize(600, 900);
			newWindow.setResizable(false);

			const plugins = await this.Plugins.get();

			await newWindow.loadFile(path.resolve(__dirname, "..", "..", "frontend", "plugins.html"));
			newWindow.once("ready-to-show", async function() {
				newWindow.webContents.send("sendPlugins", JSON.stringify(plugins));
			});
			newWindow.show();
			break;
		}

		this.windows[type] = newWindow;
		return;
	}
}

async function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

let oldSong: string = "";
function fetchMedia(musicWindow: BrowserWindow) {
	if (worker) return worker.postMessage('getCurrentMedia');

	worker = new Worker(path.join(__dirname, "..", 'SMTCWorker.js'));

	worker.on('message', async (msg: any) => {
		switch (msg.type) {
			case 'media':
				const silentAudio = path.join(__dirname, "..", "..", "silent.mp3");
				msg.result.audioURL = path.join(__dirname, "..", "..", "trimmed.mp3");
				if (oldSong == msg.result.Title) {
					return musicWindow.webContents.send("getMusic", msg.result);
				}

				oldSong = msg.result.Title;
				ffmpeg(silentAudio)
				.setStartTime("00:00:00")
				.setDuration(Math.ceil(msg.result.Position[1]/1000))
				.output("trimmed.mp3")
				.outputOptions("-c copy")
				.on("end", () => {
					musicWindow.webContents.send("getMusic", msg.result);
				}).run();
				break;
			case 'np':
				musicWindow.webContents.send("getMusic", "np");
				break;
			case 'error':
				console.error("Worker error:", msg.error);
				break;
		}
	});

	worker.on('error', (err: any) => {
		console.error("Worker thread crashed:", err);
	});

	worker.on('exit', (code: any) => {
		if (code !== 0) {
			console.error(`Worker stopped unexpectedly with code ${code}`);
		}
	});
}