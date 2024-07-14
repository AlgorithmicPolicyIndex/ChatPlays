import * as tmi from "tmi.js";
import { defineCommands, getGames, Chat } from "./functions";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";
import client from "discord-rich-presence";
import { create, getData } from "./JSON/db";
import { LiveChat } from "youtube-chat";
import { EmojiItem } from "youtube-chat/dist/types/data";

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

const commands = defineCommands();
const filter = new Filter();
let window: BrowserWindow;
create({ ActiveGame: "", SetGame: "" });

// * Electron
if (settings.useChat) {
	app.whenReady().then(() => {
		const win = new BrowserWindow({
			title: settings.processTitle,
			width: settings.width,
			height: settings.height,
			frame: false,
			roundedCorners: false,
			transparent: true, // ! this is for rounded top corner but square bottom corners (WindowsOS | FOR WINXP THEME AND ANY OTHERS WITH SPECIFIC CORNERS!)
			minWidth: settings.width,
			minHeight: settings.height,
			maxHeight: settings.height,
		});

		window = win;
		win.loadFile("../frontend/index.html");
	});
}

if (settings.platform.toUpperCase() == "TWITCH" || settings.platform.toUpperCase() == "BOTH") {
	const tmiclient = new tmi.client({
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
		message = filter.clean(message).replace(extractUrls(message), "[LINK]");
		// ! Electron Chat
		if (
			self
			|| !message.startsWith("!")
			&& settings.useChat
		) { await Chat("TWITCH", user, message, settings, window); }
	
		const Args = message.toLowerCase().slice(1).split(" ");
		
		const command = commands.get(Args.shift() as string);
		if (!command) return;
		const ActiveGame = await getData("ActiveGame");
	
		try {
			await command(Args, user["display-name"], settings, window, settings.universalName).catch((err: any) => {
				throw new Error(err)
			});
		} catch (err: any) {
			throw new Error(err);
		}
		
		try {
			if (ActiveGame != "") {
				getGames(ActiveGame, message);
			}
		} catch (err: any) {
			throw new Error(err);
		}
	});
}

if (settings.platform.toUpperCase() == "YOUTUBE" || settings.platform.toUpperCase() == "BOTH") {
	const ytclient = new LiveChat({ channelId: settings.youtube });
	ytclient.start();

	ytclient.on("start", async (liveId) => {
		console.log(`Started on: ${liveId}`);
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
		
		const ActiveGame = await getData("ActiveGame");
		try {
			if (ActiveGame != "") {
				getGames(ActiveGame, message.get("text"));
			}
		} catch (err: any) {
			throw new Error(err);
		}
	});

	ytclient.on("error", async (err:any) => {
		ytclient.stop();
		throw new Error(err);
	});
}