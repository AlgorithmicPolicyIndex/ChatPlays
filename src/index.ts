import * as tmi from "tmi.js";
import { defineCommands, getGames, Chat } from "./functions";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";
import client from "discord-rich-presence";
import { create, exists, getData } from "./JSON/db";

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

const tmiclient = new tmi.client({
	channels: [ settings.streamer ]
});

tmiclient.connect().then(async (v) => {
	if (v[1] != 443) {
		return console.info("There was an error connecting to the Twitch API");
	}
	
	console.info("Connected to Twitch API:\nStarting chat...");
		
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
	console.info("Connected!");
});


tmiclient.on("message", async (channel, user, message, self) => {
	if (self) return;
	message = filter.clean(message).replace(extractUrls(message), "[LINK]");
	// ! Electron Chat
	if (
		self
		|| !message.startsWith("!")
		&& settings.useChat
	) { await Chat(channel, user, message, settings, window); }

	if (!await exists()) {
		create({ ActiveGame: "", SetGame: "" });
	}

	const Args = message.toLowerCase().slice(1).split(" ");
	
	const command = commands.get(Args.shift() as string);
	if (!command) return;
	const ActiveGame = await getData("ActiveGame");

	try {
		await command(Args, user, settings, window, channel).catch((err: any) => {
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