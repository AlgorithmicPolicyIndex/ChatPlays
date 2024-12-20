import * as tmi from "tmi.js";
import { defineCommands, getGames, Chat, filterWithoutEmojis } from "./functions";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";
import client from "discord-rich-presence";
import { create, getData } from "./JSON/db";
import { LiveChat } from "youtube-chat";
import { EmojiItem } from "youtube-chat/dist/types/data";
import path from "path";
import { readdirSync } from "fs";

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

export const commands = defineCommands();
let window: BrowserWindow;
create({ ActiveGame: "", SetGame: "", Voice: false });

// * Electron
if (settings.useChat) {
	const aspectRatio = 650 / 959;

	function adjustAspectRatio(width: number, height: number): { newWidth: number, newHeight: number } {
		if (width / height > aspectRatio) {
			const newHeight = Math.round(width / aspectRatio);
			return { newWidth: width, newHeight };
		} else {
			const newWidth = Math.round(height * aspectRatio);
			return { newWidth, newHeight: height };
		}
	}


	const { newWidth, newHeight } = adjustAspectRatio(settings.width, settings.height);

	app.whenReady().then(async () => {
		const win = new BrowserWindow({
			title: settings.processTitle,
			width: newWidth,
			height: newHeight,
			frame: false,
			roundedCorners: false,
			transparent: true, // ! this is for rounded top corner but square bottom corners (WindowsOS | FOR WINXP THEME AND ANY OTHERS WITH SPECIFIC CORNERS!)
			minWidth: settings.minWidth,
			minHeight: settings.minHeight,
			maxWidth: settings.maxWitdh,
			maxHeight: settings.maxHeight
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

if (settings.platform.toUpperCase() == "TWITCH" || settings.platform.toUpperCase() == "BOTH") {
	const tmiclient = new tmi.client({
		connection: {
			reconnect: true,
			secure: true
		},
		channels: [ settings.twitch ]
	});
	
	tmiclient.connect().then(async (v) => {
		if (v[1] != 443) {
			return console.info("There was an error connecting to the Twitch API");
		}
		console.info("Connected to Twitch API");
	});
	
	tmiclient.on("message", async (_channel, user, message, self) => {
		if (self) return;
		message = await filterWithoutEmojis(message);

		const ActiveGame = await getData("ActiveGame");
		try {
			if (ActiveGame != "") {
				(await getGames(ActiveGame)).execute(message.toLowerCase());
			}
		} catch (err: any) {
			throw new Error(err);
		}

		// ! Electron Chat
		if (
			self
			|| !message.startsWith("!")
			&& settings.useChat
		) { await Chat("TWITCH", user, message, settings, window); }
	
		// ! Commands
		const Args = message.toLowerCase().slice(1).split(" ");
		
		const command = commands.get(Args.shift() as string);
		if (!command) return;
	
		try {
			await command(Args, user["display-name"], settings, window, settings.universalName).catch((err: any) => {
				throw new Error(err)
			});
		} catch (err: any) {
			throw new Error(err);
		}
		
	});

	tmiclient.on("subscription", async (_channel, username, _methods, _message, _user) => {
		window.webContents.executeJavaScript(`(() => {
			subscription("${username}");
		})();`);
	});
	tmiclient.on("subgift", async (_channel, username, _streak, recipient, _methods) => {
		window.webContents.executeJavaScript(`(() => {
			subscription("${username}", "${recipient}");
		})();`);
	});
}

if (settings.platform.toUpperCase() == "YOUTUBE" || settings.platform.toUpperCase() == "BOTH") {
	const ytclient = new LiveChat({ channelId: settings.youtube });
	ytclient.start();

	ytclient.on("start", async (liveId) => {
		console.log(`Connected to Youtube on: ${liveId}`);
	});

	const date = new Date();
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
			if (Object.keys(v).includes("text")) {
				if (v == undefined) return;
				// yeah, because "text" doesn't exist on EmojiItem because that's what I'm looking for. CHRIST.
				message.set("text", (v as {text: string}).text.trim() );
			}
		});

		const ActiveGame = await getData("ActiveGame");
		try {
			if (ActiveGame != "") {
				(await getGames(ActiveGame)).execute(message.get("text"));
			}
		} catch (err: any) {
			throw new Error(err);
		}

		if (!message.get("text").startsWith("!") && settings.useChat) {
			await Chat("YOUTUBE", user, message.get("text"), settings, window);
		}

		const Args = message.get("text").toLowerCase().slice(1).split(" ");
		const command = commands.get(Args.shift() as string);
		if (!command) return;
		
		try {	
			await command(Args, user.id, settings, window, settings.universalName).catch((err: any) => {
				throw new Error(err)
			});
		} catch (err: any) {
			throw new Error(err);
		}
	});

	ytclient.on("error", async (err:any) => {
		ytclient.stop();
		throw new Error(err);
	});
}