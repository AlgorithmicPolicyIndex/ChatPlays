import {servicesTypes} from "./Services";
import {BrowserWindow} from 'electron';
import {command, filterWithoutEmojis} from './functions';
import {getData} from './JSON/db';
import * as fs from 'node:fs';
import {EmojiItem} from 'youtube-chat/dist/types/data';
import {services} from "./index";

export async function runTwitch(service: servicesTypes["Twitch"]) {
	const client = service.client;
	let chatWindow: BrowserWindow | undefined;

	const settings = await getData();
	if (!client) return;

	const getChatWindow = () => {
		chatWindow = BrowserWindow.getAllWindows().find((window) => window.title === "ChatPlays - Chat");
		return chatWindow;
	};

	client.on("message", async (_channel, user, message, self) => {
		if (self) return;

		if (message.startsWith("!"))
			return await command(message, user);

		if (settings.ChatPlaysActive && fs.existsSync(settings.gamePath))
			(await import(settings.gamePath)).execute(message);

		chatWindow = getChatWindow();
		if (!chatWindow) return;
		chatWindow.webContents.send("message", {
			User: user,
			Message: await filterWithoutEmojis(message),
			Platform: "Twitch",
		});
	});

	client.on("subscription", async function (_channel, user) {
		const obs = services.getService("OBS");
		if (settings.popupEvents && obs && obs.connected)
			return obs?.newPopup("GiftSub", user);
		
		chatWindow = getChatWindow();
		if (!chatWindow) return;
		chatWindow.webContents.send("subscription", user);
	});

	client.on("subgift", async function (_channel, user, _streak, recipient) {
		const obs = services.getService("OBS");
		if (settings.popupEvents && obs && obs.connected)
			return obs?.newPopup("GiftSub", recipient, user);

		chatWindow = getChatWindow();
		if (!chatWindow) return;
		chatWindow.webContents.send("subscription", user, recipient);
	});
}


export async function runYouTube(service: servicesTypes["YouTube"]) {
	const client = service.client;
	let chatWindow: BrowserWindow | undefined;

	const settings = await getData();
	if (!client) return;

	const getChatWindow = () => {
		chatWindow = BrowserWindow.getAllWindows().find((window) => window.title === "ChatPlays - Chat");
		return chatWindow;
	};
	
	client.on("chat", async (ChatItem: any) => {
		if (ChatItem.timestamp <= new Date()) return;
		const message = new Map();
		const user = {
			"display-name": ChatItem.author.name,
			"id": ChatItem.author.channelId,
			"mod": ChatItem.isModerator,
			"badges": { broadcaster: ChatItem.isOwner ? "1" : "0" }
		};
		
		ChatItem.message.map((v: { text: string } | EmojiItem) => {
			if (v && Object.keys(v).includes("text"))
				message.set("text", (v as {text: string }).text.trim())
		});
		
		if (message.get("text").startsWith("!"))
			return await command(message.get("text"), user);
		
		if (settings.ChatPlaysActive && fs.existsSync(settings.gamePath))
			(await import(settings.gamePath)).execute(message);
		
		chatWindow = getChatWindow();
		if (!chatWindow) return;
		chatWindow.webContents.send("message", {User: user, Message: message.get("text"), Platform: "YouTube"});
	});
	
	client.on("error", (err: any) => {
		client.stop();
		throw new Error(err);
	})
}