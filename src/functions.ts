import {screen, BrowserWindow, ipcMain} from "electron";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import childProcess from 'child_process';
import {getData, updateData} from "./JSON/db";
import {services} from './index';
import {serviceData, serviceNames} from './Services';
import path from "path";
import {existsSync, readdirSync, watch} from "node:fs";
import {PythonShell} from 'python-shell';
import * as fs from 'node:fs';
import * as nut from "@nut-tree-fork/nut-js";
import { musicRequest } from "./LinuxMusic";
const filter = new Filter();

export async function command(message: string, user: any) {
	if (!message.startsWith("!")) return;
	const data = await getData();
	const Args = message.toLowerCase().slice(1).split(" ");
	const command = Args.shift();
	const chatWindow = BrowserWindow.getAllWindows().find((win) => win.title == "ChatPlays - Chat");

	switch (command) {
	case "start":
		if (data.playsChance <= Math.floor(Math.random() * 100) + 1 || data.gamePath == "") return;
		
		const name = data.gamePath.split("\\").filter((string: string) => string.includes(".js") )[0].replace(".js", "");
		if (chatWindow)
			chatWindow.webContents.send("updateGame", name);
		data.ChatPlaysActive = true;
		await updateData(data);

		return setTimeout(async () => {
			if (chatWindow) {
				chatWindow.webContents.send("updateGame", "");
			}
			data.ChatPlaysActive = false;
			await updateData(data);
		}, data.playtime * 1_000);
	case "voice":
                if (process.platform != "win32") return;
		if (data.voiceChance < Math.floor(Math.random() * 100) + 1) return;
		if (data.voiceKey == "") return;
		if (data.audio == "none") return;

		const tts = new TTS(1);
		tts.Channel = data.audio;
		
		const key = nut.Key[data.voiceKey as keyof typeof nut.Key];
		await nut.keyboard.pressKey(key);
		tts.speak(`${user['display-name']} says: ${Args.join(" ")}`).then(() => {
			nut.keyboard.releaseKey(key);
		});
		return;
	}
}

const PhraseFilters = [
	"buy followers",
	"get followers",
	"get viewers",
	"boost twitch",
	"viewers now",
	"increase views",
	"twitch promotion",
	"free followers",
	"remove the space",
	"404: hype not found"
];

const domainPattern = new RegExp(
	"\\b[a-zA-Z0-9_-]+\\s*(\\.|\\[\\.]|\\(dot\\)|\\{dot}|\\(\\.\\)|\\[dot]|\\s*dot\\s*|\\s*\\.\\s*)\\s*(com|net|org|xyz|site|io|app|live|store|info|biz)\\b",
	"i"
);

export async function filterWithoutEmojis(message: string) {
	interface CharDetails {
		char: string;
		index: number;
	}
	
	const specialCharRegex = /[^\p{L}\s]/gu;
	
	let emojisAndSpecialChars: CharDetails[] = [];
	let sanitizedMessage = message.replace(specialCharRegex, (match, index) => {
		emojisAndSpecialChars.push({ char: match, index });
		return `{specialChar${emojisAndSpecialChars.length - 1}}`;
	});
	
	sanitizedMessage = filter.clean(sanitizedMessage);
	
	emojisAndSpecialChars.forEach((item, i) => {
		const specialCharPlaceholder = `{specialChar${i}}`;
		sanitizedMessage = sanitizedMessage.replace(specialCharPlaceholder, item.char);
	});
	
	sanitizedMessage = PhraseFilters.some(phrase => {
		return sanitizedMessage.toLowerCase().includes(phrase.toLowerCase())
	}) ? "[FILTERED]" : sanitizedMessage;
	
	return sanitizedMessage.replace(await extractUrls(sanitizedMessage), "[LINK]").replace(domainPattern, "[LINK]");
}

export class TTS {
	readonly baseCommand: string;
	private child: any;
	private channel: string = '';
	constructor(public speed: number) {
		this.speed = speed;
		this.baseCommand = "$speak = New-Object -ComObject SAPI.SPVoice;";
	}

	set Channel(channel: string) {
		this.channel = channel;
	}
	
	listAudioDevices() {
                if (process.platform != "win32") return;
		return new Promise((resolve, reject) => {
			let combinedStdout = '';

			const command = this.baseCommand +
				"$speak.GetAudioOutputs() | ForEach-Object { $_.getDescription() };";

			const process = childProcess.exec('powershell -Command "' + command + '"', (error, stdout, stderr) => {
				if (error) {
					reject(`exec error: ${error}`);
					return;
				}
				if (stderr) {
					reject(`stderr: ${stderr}`);
					return;
				}
				combinedStdout += stdout;
			});

			process.on('close', () => {
				try {
					resolve(combinedStdout.trim().split("\n"));
				} catch (e) {
					reject('Error parsing PowerShell output.');
				}
			});
		});
	}

	async speak(text: string) {
                if (process.platform != "win32") return;
		return new Promise<void>((resolve, reject) => {
			const command = this.baseCommand +
				`$speak.AudioOutput = foreach ($o in $speak.GetAudioOutputs()) {if ($o.getDescription() -eq '${this.channel}') {$o; break;}}; ` +
				"$speak.Speak([Console]::In.ReadToEnd());";

			this.child = childProcess.spawn('powershell', [command], { shell: true });
			this.child.stdin.setEncoding('ascii');
			this.child.stdin.end(text);
			this.child.addListener('exit', (code: any, signal: any) => {
				if (code === null || signal !== null) {
					reject(new Error(`error [code: ${code}] [signal: ${signal}]`));
				}
				this.child = null;
				resolve();
			});
		});
	}
}

export class ipcManager {
	private windows: {
		"chatWindow"?: BrowserWindow,
		"musicWindow"?: BrowserWindow,
		"chatSettings"?: BrowserWindow
	} = {};
	private Thumbnail: string | null = null;
	private mainWindow: BrowserWindow;
	
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
		
		watch(path.resolve(__dirname, "..", "frontend", "plugins"), (_eventType, filename) => {
			if (!filename) return;
			this.mainWindow.webContents.send(
				"pluginsUpdated",
				readdirSync(
					path.resolve(__dirname, "..", "frontend", "plugins")
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
		const data = await getData();
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
	async handlePlugin(_evt: any, method: "load" | "unload", plugin: string) {
		const win = this.windows["chatWindow"];
		if (!win) return;
		if (method == "load")
			win.webContents.send("loadPlugin", plugin);
		else
			win.webContents.send("unloadPlugin", plugin);
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
	async test (_evt: any, User: string, Gifter: string) {
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
		const musicWindow = BrowserWindow.getAllWindows().find((w) => w.title === "ChatPlays - Music");
		if (process.platform === "linux") {
			const data = await musicRequest();
			if (data == "np") return musicWindow?.webContents.send("getMusic", "np");
			musicWindow?.webContents.send("getMusic", data);
		} else {
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
	}
	async createWindow(_evt: any, type: "chatWindow" | "chatSettings" | "musicWindow") {
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
			webPreferences: {
				preload: path.join(__dirname, "controlpanel.js")
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
			await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "chatSettings.html"));
			newWindow.on("ready-to-show", function() {
				newWindow.webContents.send("chatSettings", settings);
				newWindow.webContents.send("themes", readdirSync(path.join(__dirname, "..", "frontend", "Chat", "themes")));
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
			await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "Chat", "index.html"));
			newWindow.on("ready-to-show", function() { newWindow.webContents.send("chatSettings", settings); });
			newWindow.show();
			break;
		case "musicWindow":
			if (window) {
				newWindow.close();
				window.close();
				delete this.windows[type];
				return;
			}
			newWindow.setSize(600, 200);
			newWindow.setResizable(false);
			newWindow.title = "ChatPlays - Music";
			// await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "Chat", settings.theme, "music.html"));
			await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "Chat", "themes", "default", "music.html"));
			newWindow.show();
			break;
		}

		this.windows[type] = newWindow;
		return;
	}
}