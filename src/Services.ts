import settings from "./settings.json";
import {Client} from "tmi.js";
import {LiveChat} from "youtube-chat";
import {OBSWebSocket} from "obs-websocket-js";

abstract class Service {
	connected: boolean = false;
	client: Client | LiveChat | OBSWebSocket | null = null;
	abstract connect(): Promise<void>;
	abstract disconnect(): Promise<void>;
}

class Twitch extends Service {
	async connect(): Promise<void> {
		this.client = new Client({
			connection: {
				reconnect: true,
				secure: true
			},
			channels: [ settings.twitch ]
		});
		
		return this.client.connect().then((v) => {
			if (v[1] != 443) {
				throw new Error("Unable to connect to Twitch");
			}
			this.connected = true;
			console.log("Connected to Twitch API");
		});
	}
	async disconnect(): Promise<void> {
		if (!this.connected || !this.client) return;
		return (this.client as Client).disconnect().then(() => {
			this.connected = false;
			console.log(`${this.constructor.name} Client disconnected`);
		});
	}
}

class YouTube extends Service {
	async connect(): Promise<void> {
		this.client = new LiveChat({ channelId: settings.youtube });

		this.client.start().then(r => console.log(r));
	
		this.client.on("start", async liveId => {
			return console.log(`Connected To Youtube on: ${liveId}`);
		})
	}
	async disconnect(): Promise<void> {
		if (!this.connected || !this.client) return;
		(this.client as LiveChat).stop();
		
		this.connected = false;
		return console.log(`${this.constructor.name} Client disconnected`);
	}
}

class OBS extends Service {
	async connect(): Promise<void> {
		this.client = new OBSWebSocket();

		try {
			await this.client.connect(settings.OBSURL, settings.OBSPASS);
		} catch (err) {
			console.error("Unable to connect to OBS WebSockets.\nCommon Causes: \nURL, Port, Password or OBS is closed.\nFull Error:\n", err);
		}
		
		this.client.on("ConnectionOpened", () => console.log("Connected to OBS WebSocket Server."));
	}
	async disconnect(): Promise<void> {
		if (!this.connected || !this.client) return;
		await (this.client as OBSWebSocket).disconnect();
		
		this.connected = false;
		return console.log(`${this.constructor.name} WebSocket disconnected`);
	}
}

class ServiceManager {
	private services: Map<string, Service> = new Map();

	addService(name: string, service: Service) {
		this.services.set(name, service);
	}

	async connectService(name: string) {
		const service = this.services.get(name);
		const platform = settings.platform.toLowerCase();

		if (service) {

			if (
				(platform === "twitch" && name.toLowerCase() === "twitch")
				|| (platform === "youtube" && name.toLowerCase() === "youtube")
				|| platform === "both"
			) {
				if (!service.connected) {
					await service.connect();
				}
			} else if (name.toLowerCase() !== "twitch" && name.toLowerCase() !== "youtube") {
				if (!service.connected) {
					await service.connect();
				}
			}
		}
	}

	async disconnectService(name: string) {
		const service = this.services.get(name);
		if (service) {
			await service.disconnect();
		}
	}

	getServices(): string[] {
		const connectedServices: string[] = [];
		this.services.forEach((_service, name) => {
			connectedServices.push(name);
		});
		return connectedServices;
	}

	GetClient(name: string): LiveChat | Client | OBSWebSocket | null {
		const service = this.services.get(name);
		if (service) {
			return service.client;
		}
		return null;
	}
}


export {
	Twitch,
	YouTube,
	OBS,
	ServiceManager,
}