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

export async function Chat(channel: string, user: any, message: string, settings: any, window: BrowserWindow) {
	// TODO: When integrating Youtube chat, change how this works if needed.
	
	window.show();
	window.webContents.executeJavaScript(`(() => {
	// ? User blob history
	blobHistory(${settings.maxblobs});

	// ? The message history inside the blob
	let msghistory = document.getElementById("${user["display-name"]}" + count);
	if (msghistory && msghistory.childNodes.length <= ${settings.maxhistory} && prevAuthor == "${user["display-name"]}") {
		let msg = document.createElement("p");
		msg.setAttribute("id", "message");
		msg.innerHTML = pingMessage(${JSON.stringify(message)});
		msghistory.appendChild(msg);
		return;
	}

	count++; // ? used for list Element ID / new list counter
	initializeMessage("${user["display-name"]}", ${user["mod"]}, ${user["badges"]?.broadcaster}, ${JSON.stringify(settings)}, ${JSON.stringify(message)}, "${channel}");
	// ? color ping
	prevAuthor = "${user["display-name"]}";
	})();`);
}