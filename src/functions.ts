import {screen, BrowserWindow, ipcMain} from "electron";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import childProcess from 'child_process';
import {getData, updateData} from "./JSON/db";
import {services} from './index';
import {OBS, serviceData, serviceNames} from './Services';
import path from "path";
import {existsSync, readdirSync, watch} from "node:fs";
const filter = new Filter();

export async function command(message: string, user: any) {
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
		if (data.voiceChance <= Math.floor(Math.random() * 100) + 1) return;
		if (data.voiceKey == "") return;
		if (data.audio == "none") return;

		const tts = new TTS(1);
		tts.Channel = data.audio;
		return await tts.speak(`${user['display-name']} says: ${message}`);
	case "testsub":
		if (user['username'] !== data.twitchID.toLowerCase() || !chatWindow) return;
		if (data.popupEvents) {
			console.log("Popup Events");
			await (services.getService("OBS") as OBS).newPopup("Test", "API");
		}
		chatWindow.webContents.send("subscription", Args[0], Args[1]);
	}
}

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
	
	return sanitizedMessage.replace(await extractUrls(sanitizedMessage), "[LINK]");
}

export class TTS {
	readonly baseCommand: string;
	private child: any;
	private channel: string = '';
	constructor(public speed: number) {
		this.speed = speed;
		this.baseCommand = "$speak = New-Object -ComObject SAPI.SPVoice;";
	}

	get Channel(): string {
		return this.channel;
	}

	set Channel(channel: string) {
		this.channel = channel;
	}
	
	listAudioDevices() {
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
	private chatWindow: BrowserWindow | null = null;
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
		ipcMain.on("sendId", this.sendID.bind(this));
		ipcMain.on("startstop", this.startstop.bind(this));
		ipcMain.on("handlePlugin", this.handlePlugin.bind(this));
		ipcMain.on("test", this.test.bind(this));
		ipcMain.on("closepopup", this.closePopup.bind(this));
		ipcMain.on("close", this.close.bind(this));
		
		watch(path.join(__dirname, "../frontend/plugins"), (eventType, filename) => {
			if (!filename || eventType === "rename") return;
			this.mainWindow.webContents.send(
				"pluginsUpdated",
				readdirSync(
					path.join(__dirname, "../frontend/plugins")
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
		if (this.chatWindow)
			this.chatWindow.webContents.send("chatSettings", data);
		this.mainWindow.webContents.send("chatSettings", data);
		return await updateData(data);
	}
	async sendID(_evt: any, id: string, name: string) {
		if (this.chatWindow)
			this.chatWindow.webContents.send("sendID", id, name);
		this.mainWindow.webContents.send("sendId", id, name);
	}
	async handlePlugin(_evt: any, method: "load" | "unload", plugin: string) {
		if (!this.chatWindow) return;
		if (method == "load")
			this.chatWindow.webContents.send("loadPlugin", plugin);
		else
			this.chatWindow.webContents.send("unloadPlugin", plugin);
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
			for (let w of BrowserWindow.getAllWindows())
				w.close();
			for (let s of services.getServices())
				await services.disconnectService(s);
		} catch (e) {
			console.error(e);
		}
	}
	async test (_evt: any, User: string, Gifter: string) {
		const obs = services.getService("OBS");
		if (!obs || !obs.connected) return;
		await obs.newPopup("TestSub", User, Gifter);
	}
	async startstop(_evt: any, p: string | null, name: string) {
		const settings = await getData();
		if (!p) {
			if (this.chatWindow)
				this.chatWindow.webContents.send("updateGame", "");
			settings["ChatPlaysActive"] = false;
		} else if (existsSync(p)) {
			if (this.chatWindow)
				this.chatWindow.webContents.send("updateGame", name);
			settings["gamePath"] = p;
			settings["ChatPlaysActive"] = true;
		}
		await updateData(settings);
	}
	async createWindow(_evt: any, type: string, settings: any) {
		const mainBounds = this.mainWindow.getBounds();
		const [x, y] = [
			Math.round(mainBounds.x + (mainBounds.width - 400) / 2),
			Math.round(mainBounds.y + (mainBounds.height - 575) / 2)
		];
		const newWindow = new BrowserWindow({
			width: 400, height: 575,
			x, y, show: false, frame: false,
			resizable: false,
			roundedCorners: false,
			transparent: true,
			maximizable: false,
			webPreferences: {
				preload: path.join(__dirname, "controlpanel.js")
			}
		});
		
		switch (type) {
		case "chatSettings":
			const settingsWindow = BrowserWindow.getAllWindows().find((w) => w.title === "ChatPlays - Chat Settings");
			if (settingsWindow) {
				newWindow.close();
				settingsWindow.setPosition(x, y);
				return settingsWindow.focus();
			}
			
			newWindow.title = "ChatPlays - Chat Settings";
			await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "chatSettings.html"));
			newWindow.on("ready-to-show", async function() {
				newWindow.webContents.send("themes", readdirSync(path.join(__dirname, "..", "frontend", "Chat", "themes")));
				newWindow.webContents.send("monitors", screen.getAllDisplays().map((display) => {
					return display.label
				}));
				newWindow.webContents.send("chatSettingsFM", settings);
			});
			return newWindow.show();
		case "chatWindow":
			if (this.chatWindow) {
				newWindow.close();
				this.chatWindow.close();
				return this.chatWindow = null;
			}
			newWindow.setSize(parseInt(settings.chatWidth), parseInt(settings.chatHeight));
			newWindow.title = "ChatPlays - Chat";
			await newWindow.loadFile(path.resolve(__dirname, "..", "frontend", "Chat", "index.html"));
			newWindow.on("ready-to-show", async function() {
				newWindow.webContents.send("chatSettingsFM", settings);	
			});
			newWindow.show();
			this.chatWindow = newWindow;
		}
	}
}