import * as tmi from "tmi.js";
import { getCommands } from "./functions";
import say from "say";
import wrap from "word-wrap";
import Filter from "bad-words";
import { getWindows } from "@nut-tree-fork/nut-js";

const filter = new Filter();

// ! You only really need to change "streamer", as processTitle is just a custom title for the terminal window.
// * Please for the love of god make sure the name is spelled right, because this took me too long to figure out myself.
// * Since it'll just log to "no response from twitch"
const streamer = "CHANNEL NAME";
const processTitle = "ChatPlaysCMD";
// ! Note: Inside the Microsoft "Terminal" program, there is a minimum Width, which is around 456-464-
// ! Even with the setting "scrollbar visibility" set to "Hidden", still has a dedicated padding-
// ! for the scroll bar. 
// * Reason I say this, is because I use a Width smaller than 456 in my OBS scene, to properly fit-
// * The Terminal Chat
const width = 441
const height = 665

const client = new tmi.client({
	channels: [ streamer ],
});

let ActiveGame = "";
let SetGame = "";

client.connect().then(async (v) => {
	if (v[1] != 443) {
		return console.info("There was an error connecting to the Twitch API");
	}
	
	// * Title of the terminal window - only tested on Windows CMD, Terminal PWSH and GIT BASH
	process.title = processTitle;
	console.info("Connected to Twitch API:\nStarting chat in 5 seconds...\u001B[?25l");
	setTimeout(() => {
		console.clear();
		
		ResizeWindow(width, height);
	}, 5000);
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
					user["mod"] == true ? "34;1m(Mod) " : "35m"
				}${user["display-name"]}\x1b[0m in \x1b[36m${channel}\x1b[0m:\n\u2003\x1b[90;1m└──\x1b[0m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);	
				MultiIterate = 0;
			} else {
				console.log(`\u2003\x1b[90;1m└──\x1b[0m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);
				MultiIterate++;
			}
		} else {
			PrevMsgAuthor = user["display-name"] as string;
			MultiIterate = 0;
			console.log(`\n\u2003\x1b[${
				user["mod"] == true ? "34;1m(Mod) " : "35m"
			}${user["display-name"]}\x1b[0m in \x1b[36m${channel}\x1b[0m:\n\u2003\x1b[90;1m└──\x1b[0m${wrap(colorMessage(filter.clean(message)), { width: 45 })}`);
		}

	}

	// ! Chat Plays
	// TODO: Please for the love of god, fix this ugly shit
	if (user["display-name"] == streamer) {
		const Args = message.slice(1).split(" ");
		if (Args[0] == "start") {
			say.speak("started")
			return ActiveGame = Args[1];
		} else if (Args[0] == "set") {
			say.speak(`Game has been set to: ${Args[1]}`, "voice_kal_diphone");
			return SetGame = Args[1];
		} else if (Args[0] == "stop") {
			return ActiveGame = "";
		}

	} else if (message.toLowerCase() == "!start" && ActiveGame == "") {
		if (Math.floor(Math.random() * 100) + 1 == 5) {
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
	const list = msg.split(" ");
	for (const ping of list) {
		if (ping.includes("@")) {
			list[list.indexOf(ping)] = `\x1b[33;1m${ping}\x1b[0m`;
		}
	}
	return list.join(" ");
}

async function ResizeWindow(width: number, height: number) {
	await getWindows().then(async (l) => {
		for (const window of l) {
			if (await window.getTitle() != processTitle) continue;
			await window.resize({
				width, height,
				area: function (): number {
					throw new Error("Function not implemented.");
				}
			});
		}
	});
}