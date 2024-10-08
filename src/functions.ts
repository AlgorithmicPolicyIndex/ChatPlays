import * as path from "path";
import * as fs from "fs";
import { BrowserWindow } from "electron";
const extensions = [".ts", ".js"];

export async function getGames(name: string, message: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		if (name.toLowerCase() == command.name.toLowerCase()) {
			return command.execute(message.toLowerCase());
		}
	}
}

export async function getGameName(name: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		
		if (name.toLowerCase() == command.name.toLowerCase()) {
			return command.name;
		}
	}
}

export function defineCommands() {
	const commands = new Map<string, any>();
	const cmdPath = path.join(__dirname, "commands");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
		return extensions.some(ex => file.endsWith(ex));
	});
	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = require(filePath);
		commands.set(command.name.toLowerCase(), command.execute); 
	}
	return commands;
};

let emoteWarn = false;
let user_id: string | undefined = undefined;
export async function Chat(platform: string, user: any, message: string, settings: any, window: BrowserWindow) {
	if (
		// ! This is gross
		// TODO: Figure out how to get the ID without the streamer typing in chat for their userID
		settings.useOtherEmotes
		&& user["display-name"]?.toLowerCase() == settings.twitch.toLowerCase()
		&& user_id == undefined
	) {
		user_id = user["user-id"];
	}

	// ! Get Emote and replace with img tag
	// * Twitch Emotes
	if (platform == "TWITCH" || platform == "BOTH") {
		let replacements: { strToReplace: string; replacement: string; }[] = [];
		const emotes: { string: [ string ] } = user["emotes"];
	
		if (emotes) {
			Object.entries(emotes).forEach(([id, positions]) => {
				const position = positions[0];
				const [start, end] = position.split("-");
				const strToReplace = message.substring(
					parseInt(start, 10),
					parseInt(end, 10) + 1
				);
		
				replacements.push({
					strToReplace,
					replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0">`
				});
			});
		}
	
		if (settings.useOtherEmotes && user_id != undefined) {
			// * BTTV
			// ? Global BTTV Emotes
			await fetch(`https://api.betterttv.net/3/cached/emotes/global`).then(async (res) => {
				let data = await res.json();
				
				for (let emote of data) {
					strToEmote(message, emote, replacements);
				}
			});
			// ? Channel BTTV Emotes
			await fetch(`https://api.betterttv.net/3/cached/users/${platform.toLowerCase()}/${user_id}`).then(async (res) => {
				let data = await res.json();
				
				for (let emote of data["sharedEmotes"]) {
					strToEmote(message, emote, replacements);
				}
				for (let emote of data["channelEmotes"]) {
					strToEmote(message, emote, replacements);
				}
			});
		} else {
			if (!emoteWarn)  {
				console.info("Please make sure to type into your own chat.\nI need your user-id to be able to search the BTTV channel emotes");
				emoteWarn = true;
			}
		}
		
		message = replacements.reduce(
			(acc, { strToReplace, replacement }) => {
				return acc.split(strToReplace).join(replacement);
			},
			message
		);
	}
	
	window.show();
	window.webContents.executeJavaScript(`(() => {
	// ? User blob history
	blobHistory(${settings.maxblobs});

	// ? The message history inside the blob
	let msghistory = document.getElementById("${user["display-name"]}" + count);
	if (msghistory && msghistory.childNodes.length <= ${settings.maxhistory} && prevAuthor == "${user["display-name"]}") {
		let css = document.getElementById("css");
		// TODO: Will probably be moving message history into the theme .js file to make this line theme specific
		if (brb && css.getAttribute("href") == "theme/winxp/winxp.css") {
			return;
		}
		let msg = document.createElement("p");
		msg.setAttribute("id", "message");
		msg.innerHTML = pingMessage(${JSON.stringify(message)});
		msghistory.appendChild(msg);
		return;
	}

	count++; // ? used for list Element ID / new list counter
	initializeMessage("${user["display-name"]}", ${user["mod"]}, ${user["badges"]?.broadcaster}, ${JSON.stringify(settings)}, ${JSON.stringify(message)}, "${platform}");
	// ? color ping
	prevAuthor = "${user["display-name"]}";
	})();`);
}

function strToEmote(message: string, emote: any, replacements: { strToReplace: string; replacement: string; }[]) {
	let idx = message.split(" ").indexOf(emote.code);
	if (idx > -1) {
		replacements.push({
			strToReplace: emote.code,
			replacement: `<img src="https://cdn.betterttv.net/emote/${emote.id}/1x">`
		});
	}
}
