import * as tmi from "tmi.js";
import { getCommands } from "./functions";
import say from "say";
import wrap from "word-wrap";
import Filter from "bad-words";
// import { getWindows } from "@nut-tree-fork/nut-js";
import extractUrls from "extract-urls";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";

const filter = new Filter();

const client = new tmi.client({
	channels: [ settings.streamer ],
});

let ActiveGame = "";
let SetGame = "";

client.connect().then(async (v) => {
	if (v[1] != 443) {
		return console.info("There was an error connecting to the Twitch API");
	}
	
	// * Title of the terminal window - only tested on Windows CMD, Terminal PWSH and GIT BASH
	process.title = settings.processTitle;
	console.info("Connected to Twitch API:\nStarting chat in 5 seconds...\u001B[?25l");
	setTimeout(() => {
		console.log("Connected!");
	}, 5000);
});

// * Electron
let window: BrowserWindow;
app.whenReady().then(() => {
	const win = new BrowserWindow({
		title: settings.processTitle,
		width: settings.width,
		height: settings.height,
		frame: true,
		x: 100,
		y: 250
	});

	window = win;
	win.loadFile("../frontend/index.html");
});

let PrevMsgAuthor = "";
let MultiIterate = 0;
client.on("message", async (channel, user, message, self) => {
	if (self) return;
	// ! Terminal Chat
	// ! It's going to get worse from here.
	if (
		self ||
		!message.startsWith("!")
	) {
		if (user["display-name"] == PrevMsgAuthor) {
			// ! I don't want to do message history, but I might do it.
			// ! But if I do, I'll be switching "terminal" chat, to an Electron App.
			// ! If I do, better scalability, more freedom in UI design and makes message history easier, as I can use list elements, and use an ID to edit that group
			// ! and message. However, I haven't messed with HTML frameworks is awhile.
			// ? Make list of previous messages to change the └ to a "t" so it connects to the next message bar?
			if (MultiIterate == 3) { // ! This is set to 4 message, before creating a new "message"
				console.log(`\n\u2003\x1b[${
					user["mod"] == true ? `${settings.moderator};1m(Mod) ` : `${settings.username}m`
				}${user["display-name"]}\x1b[0m in \x1b[${settings.channel}m${channel}\x1b[0m:\n\u2003\x1b[${settings.bracket};1m└──\x1b[${settings.message}m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);	
				MultiIterate = 0;
			} else {
				console.log(`\u2003\x1b[${settings.bracket};1m└──\x1b[${settings.message}m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);
				MultiIterate++;
			}
		} else {
			PrevMsgAuthor = user["display-name"] as string;
			MultiIterate = 0;
			console.log(`\n\u2003\x1b[${
				user["mod"] == true ? `${settings.moderator};1m(Mod) ` : `${settings.username}m`
			}${user["display-name"]}\x1b[0m in \x1b[${settings.channel}m${channel}\x1b[0m:\n\u2003\x1b[${settings.bracket};1m└──\x1b[${settings.message}m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);
		}

		// TODO: Will create more history blobs when prevAuthor is different
		// TODO: However, if prevAuthor matches, it uses the first element under the username ID, instead of the last one.
		// !
		// TODO: Max User/Message count to prevent scroll bar
		// TODO: ^ Auto delete the oldest/first item list
		// !
		// TODO: Add all Channel to the list
		// TODO: Add all Colors
		window.webContents.executeJavaScript(`(() => {
		let msghistory = document.getElementById("${user["display-name"]}");
		if (msghistory && prevAuthor == "${user["display-name"]}") {
			let msg = document.createElement("p");
			msg.setAttribute("id", "message");
			msg.innerText = "${colorMessage(filter.clean(message))}";
			msghistory.appendChild(msg);
			return;
		}
		
		
		let name = document.createElement("h2");
		name.setAttribute("id", "name");
		name.innerText = "${user["display-name"]}";
		let initMsg = document.createElement("p");
		initMsg.setAttribute("id", "message");
		initMsg.innerText = "${colorMessage(filter.clean(message))}" ;
		let historyBlob = document.createElement('li');
		historyBlob.setAttribute("id", "${user["display-name"]}");
		
		historyBlob.appendChild(name);
		historyBlob.appendChild(initMsg);
		
		document.getElementById("history").appendChild(historyBlob);
		prevAuthor = "${user["display-name"]}";
		})();`);
	}

	// ! Chat Plays
	// TODO: Fixed mostly, could be better. Personally, dont like the 3 "if (user['displa...) {...}"
	const Args = message.toLowerCase().slice(1).split(" ");
	switch (Args.shift()) {
	case "start":
		if (user["display-name"] == settings.streamer) {
			say.speak("started");
			return ActiveGame = Args[1];
		}

		if (ActiveGame == "" && Math.floor(Math.random() * 100) + 1 == 5) {
			if (SetGame == "") {
				return say.speak(`${user["display-name"]} has activated Chat Plays. However, there was no game set. Unable to activate.`);
			}
			say.speak(`${user["display-name"]} has Activated Chat Plays for: ${SetGame} for 30 seconds.`);
			ActiveGame = SetGame;
		}
		setTimeout(() => {
			say.speak("Deactivating Chat Plays.");
			ActiveGame = "";
		}, 30_000); // TODO: Set a dedicated timer inside the game controls instead of hard coded value globally
		break;
	case "set":
		if (user["display-name"] == settings.streamer) {
			say.speak(`Game has been set to: ${Args[1]}`, "voice_kal_diphone");
			return SetGame = Args[1];
		}
		break;
	case "stop":
		if (user["display-name"] == settings.streamer) {
			return ActiveGame = "";
		}
		break;
	}

	try {
		if (ActiveGame != "") {
			getCommands(ActiveGame, message.toLowerCase());
		}
	} catch (err) {
		return console.error(err);
	}
});

function colorMessage(msg: string) {
	msg = msg.replace(extractUrls(msg), "[LINK]");
	const list = msg.split(" ");
	for (const ping of list) {
		if (ping.includes("@")) {
			list[list.indexOf(ping)] = `\x1b[33;1m${ping}\x1b[0m`;
		}
	}
	return list.join(" ");
}

// async function ResizeWindow(width: number, height: number) {
// 	await getWindows().then(async (l) => {
// 		for (const window of l) {
// 			if (await window.getTitle() != settings.processTitle) continue;
// 			await window.resize({
// 				width, height,
// 				area: function (): number {
// 					throw new Error("Function not implemented.");
// 				}
// 			});
// 		}
// 	});
// }