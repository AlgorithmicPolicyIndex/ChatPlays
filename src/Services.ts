import {Client} from "tmi.js";
import {LiveChat} from "youtube-chat";
import {OBSWebSocket} from "obs-websocket-js";
import { EventEmitter } from "node:events";
import {getData} from './JSON/db';
import electron, {BrowserWindow} from 'electron';
import path from 'path';

interface Data {
	Channel: string;
}
interface OBSData {
	Port: string;
	Password: string;
}
export type serviceData = {
	Twitch: Data,
	YouTube: Data,
	OBS: OBSData;
}

export abstract class Service<service, Data extends serviceNames> {
	connected: boolean = false;
	client: service | null = null;
	abstract connect(data: serviceData[Data]): Promise<{ success: boolean }>;
	abstract disconnect(): Promise<{ success: boolean }>;
}

class Twitch extends Service<Client, "Twitch"> {
	async connect(data: Data): Promise<{ success: boolean }> {
		this.client = new Client({
			connection: {
				reconnect: true,
				secure: true
			},
			channels: [ data.Channel ]
		});
		if (!data.Channel) return { success: false };
		
		try {
			await this.client.connect();
			this.connected = true;
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false };
		}
	}
	async disconnect(): Promise<{ success: boolean }> {
		if (!this.connected || !this.client) return { success: false };
		try {
			await this.client.disconnect();
			this.connected = false;
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false };
		}
	}
}

class YouTube extends Service<LiveChat, "YouTube"> {
	async connect(data: Data): Promise<{ success: boolean }> {
		this.client = new LiveChat({ channelId: data.Channel });
		try {
			await this.client.start()
			this.client.on("start", async () => { this.connected = true; });
			this.connected = true;
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false };
		}
	}
	async disconnect(): Promise<{ success: boolean }> {
		if (!this.connected || !this.client) return { success: false };
		try {
			this.client.stop();
			this.connected = false;
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false };
		}
	}
}

class OBS extends Service<OBSWebSocket, "OBS"> {
	client = new OBSWebSocket();
	popups = new Map<string, BrowserWindow>();
	async connect(data: serviceData["OBS"]): Promise<{ success: boolean }> {
		try {			
			await this.client.connect(`ws://localhost:${data.Port}`, data.Password);
			this.connected = true;
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false };
		}
	}
	async disconnect(): Promise<{ success: boolean }> {
		if (!this.connected || !this.client) return { success: false };
		try {
			await this.client.disconnect().then(() => {
				this.connected = false;
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false };
		}
	}
	
	async newPopup(title: string, user: string, gifter?: string) {
		const settings = await getData();
		const display = electron.screen.getAllDisplays()[settings.monitor];
		if (!display) return console.error("No external display. Please make sure the monitor index is correct.");
		
		const [pW, pH] = [parseInt(settings.popupW) + 5, parseInt(settings.popupH) + 5];
		const [maxX, maxY] = [display.bounds.x + display.bounds.width, display.bounds.y + display.bounds.height];
		const [column, row] = [this.popups.size % Math.floor(display.bounds.width / pW), Math.floor(this.popups.size / Math.floor(display.bounds.width / pW))];
	        let [x, y] = [display.bounds.x + 5 + column * pW, display.bounds.y + 5 + row * settings.popupH];
		
		if (x + pW > maxX) {
			x = display.bounds.x + 5;
			y += settings.popupH;
		} else if (y + pH > maxY) {
			x = display.bounds.x + 5;
			y = display.bounds.y + 5;
		}
		
		const win = new BrowserWindow({
			title: title + (this.popups.size + 1),
			width: parseInt(settings.popupW),
			height: parseInt(settings.popupH),
			x, y,
			frame: false,
			roundedCorners: false,
			transparent: true,
			webPreferences: {
				contextIsolation: true,
				preload: path.join(__dirname, "popup.js")
			}
		});
		
		await win.loadFile(`../frontend/Chat/themes/${settings.theme}/popup.html`);
		// TODO: Correct closure of window via button.
		
		win.on("ready-to-show", () =>
			win.webContents.send("UpdateText", user, gifter)
		);
		this.popups.set(title + (this.popups.size + 1), win);
		
		 await this.createSource(title + this.popups.size, "window_capture", {
		 	window: `${title + this.popups.size}:Chrome_WidgetWin_1:electron.exe`
		 });
		 
	}
	async createSource(inputName: string, inputKind: string, inputSettings: { window: string }) {
		const settings = await getData();
		const t = await this.client.call("CreateInput", {
			sceneUuid: (await this.client.call("GetCurrentProgramScene")).sceneUuid,
			inputName,
			inputSettings,
			inputKind,
			sceneItemEnabled: false
		});
		await this.transformSource(t.sceneItemId, settings.popupW, settings.popupH);
		await this.client.call("SetSceneItemEnabled", {
			sceneUuid: (await this.client.call("GetCurrentProgramScene")).sceneUuid,
			sceneItemId: t.sceneItemId,
			sceneItemEnabled: true
		});
	}
	
	async transformSource(sceneItemId: number, popupW: number, popupH: number) {
		const video = await this.client.call("GetVideoSettings");
		await this.client.call("SetSceneItemTransform", {
			sceneUuid: (await this.client.call("GetCurrentProgramScene")).sceneUuid,
			sceneItemId,
			sceneItemTransform: {
				positionX: Math.min(Math.floor(Math.random() * video.outputWidth), video.outputWidth - popupW),
				positionY: Math.min(Math.floor(Math.random() * video.outputHeight), video.outputHeight - popupH)
			}
		});
	}
	
	async deleteSource(inputName: string) {
		await this.client.call("RemoveInput", { inputName });
		return this.popups.delete(inputName);
	}
	
	async deleteSources() {
		for (const [K, W] of this.popups) {
			this.popups.delete(K);
			await this.client.call("RemoveInput", { inputName: W.title });
		}
	}
}

type serviceNames = "Twitch" | "OBS" | "YouTube";
type servicesTypes = {
	Twitch: Twitch,
	OBS: OBS,
	YouTube: YouTube
}
class ServiceManager extends (EventEmitter as {
	new (): EventEmitter & {
		emit<T extends serviceNames>(event: 'ServiceConnected', name: T, service: servicesTypes[T]): boolean;
		on<T extends serviceNames>(event: 'ServiceConnected', listener: (name: T, service: servicesTypes[T]) => void): void
	}
}) {
	private services: Map<serviceNames, servicesTypes[serviceNames]> = new Map();
	
	addService<T extends serviceNames>(name: T, service: servicesTypes[T]) {
		this.services.set(name, service);
	}
	
	async connectService<T extends serviceNames>(name: T, data: serviceData[T]) {
		const service = this.services.get(name) as Service<servicesTypes[T], T>;

		if (!service || service.connected) return { success: false };
		
		await service.connect(data);
		this.emit("ServiceConnected", name, service);
		return { success: true };
	}

	async disconnectService<T extends serviceNames>(name: T) {
		const service = this.services.get(name);
		if (!service || !service.connected) return { success: false };
		
		await service.disconnect();
		return { success: true };
	}

	getServices(): serviceNames[] {
		const connected: serviceNames[] = [];
		this.services.forEach((service, name) => {
			if (service.connected) {
				connected.push(name);
			}
		});
		return connected;
	}
	
	getService<T extends serviceNames>(name: T): servicesTypes[T] | undefined {
		return this.services.get(name) as servicesTypes[T] | undefined;
	}
}


export {
	Twitch,
	YouTube,
	OBS,
	ServiceManager,
	serviceNames,
	servicesTypes
}