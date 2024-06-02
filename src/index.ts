import * as tmi from "tmi.js";
import { getCommands } from "./functions";
import say from "say";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import settings from "./settings.json";
import { app, BrowserWindow } from "electron";

const filter = new Filter();

const client = new tmi.client({
	channels: [ settings.streamer ],
});

let ActiveGame = "";
let SetGame = "";
let brb = false;
let window: BrowserWindow;
client.connect().then(async (v) => {
	if (v[1] != 443) {
		return console.info("There was an error connecting to the Twitch API");
	}
	
	console.info("Connected to Twitch API:\nStarting chat in 5 seconds...\u001B[?25l");
		
	// * Electron
	app.whenReady().then(() => {
		const win = new BrowserWindow({
			title: settings.processTitle,
			width: settings.width,
			height: settings.height,
			frame: false,
			roundedCorners: false,
			webPreferences: {
				
			}
		});

		window = win;
		win.loadFile("../frontend/index.html");
	});
	console.info("Connected!");
});

client.on("message", async (channel, user, message, self) => {
	if (self) return;
	message = filter.clean(message);
	message = message.replace(extractUrls(message), "[LINK]");
	// ! Electron Chat
	if (
		self ||
		!message.startsWith("!")
	) {
		// ! There might be ways to refactor this to be better, but I'm not good enough-
		// ! at HTML and shit to do that.
		// ! So this works.
		// ! Do I hate that this is all a string? YES. VERY MUCH.
		window.webContents.executeJavaScript(`(() => {
		// ? If total list is over 7 elements long, delete first/"oldest" list element
		if (document.getElementById("history").childNodes.length > 6) {
			let deleteFrom = document.getElementById("history");
			let fstmsg = document.getElementById(firstMessage);
			deleteFrom.removeChild(fstmsg);
			firstMessage = document.getElementById("history").childNodes[0].id;
		}

		// ? The message history
		let msghistory = document.getElementById("${user["display-name"]}" + count);
		if (msghistory && msghistory.childNodes.length <= ${settings.maxhistory} && prevAuthor == "${user["display-name"]}") {
			let msg = document.createElement("p");
			msg.setAttribute("id", "message");
			msg.setAttribute("style", "color: ${settings.message}");
			msg.innerHTML = pingMessage(\`${message}\`);
			msghistory.appendChild(msg);
			
			let pingmsgs = document.getElementsByName("ping");
			for (let ping of pingmsgs) {
				if (ping) {
					return ping.setAttribute("style", "color: ${settings.ping}");
				}
			}
			return;
		}

		count++; // ? used for list Element ID / new list counter
		// ? The whole message blob creation shit
		let historyBlob = document.createElement('li');
		if (firstMessage == "") {
			firstMessage = "${user["display-name"]}" + count;
		}
		historyBlob.setAttribute("id", "${user["display-name"]}" + count);
		historyBlob.setAttribute("style", "border-color: rgb(95, 95, 95);")
		let name = document.createElement("h2");
		name.setAttribute("id", "name");
		// TODO: Username Colors
		if (${user["badges"]?.broadcaster == "1"}) {
			name.setAttribute("style", "color: ${settings.broadcaster};");
		} else if (${user["mod"]}) {
			name.setAttribute("style", "color: ${settings.moderator};");
		} else {
			name.setAttribute("style", "color: ${settings.username};");
		}
		name.innerHTML = "${user["mod"] ? "(mod) " + user["display-name"] : user["display-name"]} <span class='channel' style='color: ${settings.channel}'>- ${channel}</span>";
		let initMsg = document.createElement("p");
		initMsg.setAttribute("id", "message");
		initMsg.setAttribute("style", "color: ${settings.message}");
		initMsg.innerHTML = pingMessage(\`${message}\`);
		
		historyBlob.appendChild(name);
		historyBlob.appendChild(initMsg);
		
		// ? we have a message! oh and then color the ping if there is one.
		document.getElementById("history").appendChild(historyBlob);
		let pingmsgs = document.getElementsByName("ping");
			for (let ping of pingmsgs) {
				if (ping) {
					ping.setAttribute("style", "color: ${settings.ping}");
				}
			};
		prevAuthor = "${user["display-name"]}";
		})();`);
	}

	// ! Chat Plays
	// TODO: Fixed mostly, could be better. Personally, dont like the 3 "if (user['displa...) {...}"
	const Args = message.toLowerCase().slice(1).split(" ");
	switch (Args.shift()) {
	case "start":
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
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
		return;
	case "set":
		if (user["username"]?.toLowerCase() == settings.streamer.toLowerCase()) {
			SetGame = Args[0];
			
			// say.speak(`Game has been set to: ${SetGame}`, "voice_kal_diphone");
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
			getCommands(ActiveGame, message.toLowerCase());
		}
	} catch (err) {
		return console.error(err);
	}
});