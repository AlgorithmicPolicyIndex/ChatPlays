import {
	Chat,
	filterWithoutEmojis,
	adjustAspectRatio,
	newPopup,
	Command,
	Game
} from "./functions";
import settings from "./settings.json";
import {app, BrowserWindow} from "electron";
import client from "discord-rich-presence";
import { create } from "./JSON/db";
import { LiveChat } from "youtube-chat";
import { EmojiItem } from "youtube-chat/dist/types/data";
import path from "path";
import { readdirSync } from "fs";
import {OBS, ServiceManager, Twitch, YouTube} from "./Services";
import {Client} from "tmi.js";
import {OBSWebSocket} from "obs-websocket-js";

if (settings.discordRPC) { // ! If you want to have a discord Presence
	// ? Yes this had no point, I just wanted to make it. fight me. I'm not sure what to really add atm, other than fixing some things.
	// ? Such as the control generator, control scheme in files, and some other very small things.
	// ? To be fair, it's all I really need to do anyways, this is essentially done, except the chat part.
	// ? Since I wanted this to be more than just ChatPlays, but also a chat overlay.
	client(settings.RPCClientID).updatePresence({
		details: settings.details,
		state: settings.state,
		startTimestamp: Date.now(),
		largeImageKey: settings.LargeImage,
		largeImageText: settings.LargeText,
		smallImageKey: settings.SmallImage,
		smallImageText: settings.SmallText,
		instance: true,
	});
}

export const services = new ServiceManager();
let window: BrowserWindow;
create({ ActiveGame: "", SetGame: "", Voice: false, Theme: "default" });

// * Electron
if (settings.useChat) {
	const { newWidth, newHeight } = adjustAspectRatio(settings.width, settings.height);

	app.whenReady().then(async () => {
		const win = new BrowserWindow({
			title: settings.processTitle,
			width: newWidth,
			height: newHeight,
			frame: false,
			roundedCorners: false,
			transparent: true, // ! this is for rounded top corner but square bottom corners (Win11 OS | FOR WINXP THEME AND ANY OTHERS WITH SPECIFIC CORNERS!)
			minWidth: settings.minWidth,
			minHeight: settings.minHeight,
			maxWidth: settings.maxWitdh,
			maxHeight: settings.maxHeight,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true
			}
		});

		window = win;

		const pluginPath = path.join(__dirname, "..", "frontend", "plugins");
		const pluginFiles = readdirSync(pluginPath).filter(file => file.endsWith(".js"));
		win.webContents.executeJavaScript(`
			enabledPlugins = "${settings.enabledPlugins}".split(",");
			plugins = "${settings.disabledPlugins}".split(",");
		`);
		for (const file of pluginFiles) {
			win.webContents.executeJavaScript(`(() => {
				if (enabledPlugins.includes("./plugins/${file}")) return;
				plugins.push("./plugins/${file}");
			})(); loadPlugins();`);
		}
		win.loadFile("../frontend/index.html");
	});
}

// ! Services
services.addService("Twitch", new Twitch());
services.addService("YouTube", new YouTube());
services.addService("OBS", new OBS());
services.getServices().forEach(async (service) => {
	await services.connectService(service);
});

// ! Twitch
let count = 1;
const tmiclient = services.GetClient("Twitch") as Client;
if (tmiclient) {
	tmiclient.on("message", async (_channel, user, message, self) => {
		if (self) return;
		message = await filterWithoutEmojis(message);

		await Game(message);

		// ! Electron Chat
		if (!message.startsWith("!") && settings.useChat)
			return await Chat("TWITCH", user, message, settings, window);

		await Command(message, user["display-name"]);
	});

	tmiclient.on("subscription", async (_channel, username, _methods, _message, _user) => {
		if (settings.usePopupEvents) {
			await newPopup(services.GetClient("OBS") as OBSWebSocket, `Popup ${count}`, username, settings);
			return count++;
		}
		await window.webContents.executeJavaScript(`(() => {
			subscription("${username}");
		})();`);
	});
	tmiclient.on("subgift", async (_channel, username, _streak, recipient, _methods) => {
		if (settings.usePopupEvents) {
			await newPopup(services.GetClient("OBS") as OBSWebSocket, `Popup ${count}`, recipient, settings, username);
			return count++;
		}
		await window.webContents.executeJavaScript(`(() => {
			subscription("${username}", "${recipient}");
		})();`);
	});
}

// ! Youtube
const ytclient = services.GetClient("YouTube") as LiveChat;
const date = new Date();
if (ytclient) {
	ytclient.on("chat", async (ChatItem) => {
		// * Prevents loading of all messages that happened BEFORE application connects.
		if (ChatItem.timestamp <= date) return;

		const message = new Map();
		const user = { // * Fake Twitch user Structure for moderator and broadcaster flags in Chat()
			"display-name": ChatItem.author.name,
			"id": ChatItem.author.channelId,
			"mod": ChatItem.isModerator,
			"badges": { broadcaster: ChatItem.isOwner ? "1" : "0" }
		};

		ChatItem.message.map((v: { text: string } | EmojiItem) => {
			if (v && Object.keys(v).includes("text")) {
				// yeah, because "text" doesn't exist on EmojiItem because that's what I'm looking for. CHRIST.
				message.set("text", (v as {text: string}).text.trim() );
			}
		});

		await Game(message.get("text"));

		if (!message.get("text").startsWith("!") && settings.useChat)
			return await Chat("YOUTUBE", user, message.get("text"), settings, window);

		await Command(message.get("text"), user.id);
	});

	ytclient.on("error", (err:any) => {
		ytclient.stop();
		throw new Error(err);
	});
}