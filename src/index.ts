import * as tmi from "tmi.js";
import { getCommandName, getCommands } from "./functions";
import say from "say";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";
import client from "discord-rich-presence";

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

const filter = new Filter();
let ActiveGame = "";
let SetGame = "";
let brb = false;
let window: BrowserWindow;

const tmiclient = new tmi.client({
	channels: [ settings.streamer ],
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
				thickFrame: false,
				minWidth: settings.width,
				minHeight: settings.height,
				maxHeight: settings.height
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
	) {
		window.webContents.executeJavaScript(`(() => {
		// ? User blob history
		blobHistory(${settings.maxblobs});

		// ? The message history inside the blob
		let msghistory = document.getElementById("${user["display-name"]}" + count);
		if (msghistory && msghistory.childNodes.length <= ${settings.maxhistory} && prevAuthor == "${user["display-name"]}") {
			let msg = document.createElement("p");
			msg.setAttribute("id", "message");
			msg.setAttribute("style", "color: ${settings.message}");
			msg.innerHTML = pingMessage(${JSON.stringify(message)});
			msghistory.appendChild(msg);
			// ? color ping
			colorPing();
			return;
		}

		count++; // ? used for list Element ID / new list counter
		initializeMessage("${user["display-name"]}", ${user["mod"]}, ${user["badges"]?.broadcaster}, ${JSON.stringify(settings)}, ${JSON.stringify(message)}, "${channel}");
		// ? color ping
		colorPing("${settings.ping}");
		prevAuthor = "${user["display-name"]}";
		})();`);
	}

	// ! Chat Plays
	// TODO: Fixed mostly, could be better. Personally, dont like the 3 "if (user['usernam...) {...}"
	const Args = message.toLowerCase().slice(1).split(" ");
	switch (Args.shift()) {
	case "start":
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
			if (await getCommandName(Args[0]) == undefined){
				say.speak("This game name does not exist in the commands folder. Please make sure the name is spelled correctly.");
				return console.log("Not a game name does not match");
			}

			say.speak("started");
			return ActiveGame = Args[0];
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
		return;
	case "set":
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
			if (await getCommandName(Args[0]) == undefined){
				say.speak("This game name does not exist in the commands folder. Please make sure the name is spelled correctly.");
				return console.log("Not a game name does not match");
			}
				
			SetGame = Args[0];
			say.speak(`Game has been set to: ${SetGame}`, "voice_kal_diphone");
			window.webContents.executeJavaScript(`(() => {
				let curgame = document.getElementById("curgame");
				curgame.style.color = "${settings.currentGame}";
				curgame.innerHTML = "Current Game: ${SetGame} - ChatPlays Active!";
			})();
			`);
		}
		return;
	case "reset":
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
			ActiveGame = "";
			SetGame = "";
			window.webContents.executeJavaScript(`(() => {
				let curgame = document.getElementById("curgame");
				curgame.style.color = "#e45649";
				curgame.innerHTML = "Current Game: None - ChatPlays Offline!";
			})();
			`);
		}
		return;
	case "brb": 
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
			if (brb) {
				window.webContents.executeJavaScript(`(() => {
					let x = document.getElementById("brb");
					x.setAttribute("class", "");
				})();
				`);
				return brb = false;
			}

			window.webContents.executeJavaScript(`(() => {
				let x = document.getElementById("brb");
				x.setAttribute("class", "vis");
			})();
			`);
			return brb = true;
		}
		return;
	}

	try {
		if (ActiveGame != "") {
			getCommands(ActiveGame, message);
		}
	} catch (err) {
		return console.error(err);
	}
});