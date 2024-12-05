import * as path from "path";
import * as fs from "fs";
import { BrowserWindow } from "electron";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import { writeFileSync } from "fs";
const extensions = [".ts", ".js"];
const filter = new Filter();

export async function getGames(name: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
		return extensions.some(ex => file.endsWith(ex));
	});

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		if (name.toLowerCase() == command.name.toLowerCase()) {
			return command;
		}
	}
}

export async function getGameName(name: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
		return extensions.some(ex => file.endsWith(ex));
	});

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

export async function Chat(platform: string, user: any, message: string, settings: any, window: BrowserWindow) {
	if (
		// ! This is gross
		// TODO: Figure out how to get the ID without the streamer typing in chat for their userID
		settings.useOtherEmotes
		&& user["display-name"]?.toLowerCase() == settings.twitch.toLowerCase()
		&& user["user-id"] != settings.userId
	) {
		settings.userId = user["user-id"];
		
		// updates the default settings.json
		writeFileSync(path.join(__dirname, "..", "src", "settings.json"), JSON.stringify(settings, null, 8));
		// updates the Build version of the settings.json
		writeFileSync(path.join(__dirname, "settings.json"), JSON.stringify(settings, null, 8));
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
	
		if (settings.useOtherEmotes && settings.userId != "undefined") {
			// * BTTV
			// ? Global BTTV Emotes
			await fetch(`https://api.betterttv.net/3/cached/emotes/global`).then(async (res) => {
				let data = await res.json();
				
				for (let emote of data) {
					strToEmote(message, emote, replacements);
				}
			});
			// ? Channel BTTV Emotes
			await fetch(`https://api.betterttv.net/3/cached/users/${platform.toLowerCase()}/${settings.userId}`).then(async (res) => {
				let data = await res.json();
				
				for (let emote of data["sharedEmotes"]) {
					strToEmote(message, emote, replacements);
				}
				for (let emote of data["channelEmotes"]) {
					strToEmote(message, emote, replacements);
				}
			});
		} else {
			console.info("Please make sure to type into your own chat.\nI need your user-id to be able to search the BTTV channel emotes.\n\n");
		}
		
		message = replacements.reduce(
			(acc, { strToReplace, replacement }) => {
				return acc.split(strToReplace).join(replacement);
			},
			message
		);
	}
	
	// window.show();
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

export async function filterWithoutEmojis(message: string) {
	interface CharDetails {
		char: string;
		index: number;
		type: 'emoji' | 'specialChar';
	}

	// const emojiRegex = /[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}(?![0-9]\)\]/gu;
	const specialCharRegex = /[^\p{L}\s]/gu;
	
	let emojisAndSpecialChars: CharDetails[] = [];
	let sanitizedMessage = message.replace(specialCharRegex, (match, index) => {
		emojisAndSpecialChars.push({ char: match, index, type: 'specialChar' });
		return `{specialChar${emojisAndSpecialChars.length - 1}}`;
	});
	
	sanitizedMessage = filter.clean(sanitizedMessage);
	
	emojisAndSpecialChars.forEach((item, i) => {
		const specialCharPlaceholder = `{specialChar${i}}`;
		sanitizedMessage = sanitizedMessage.replace(specialCharPlaceholder, item.char);
	});
	
	return sanitizedMessage.replace(await extractUrls(sanitizedMessage), "[LINK]");
}