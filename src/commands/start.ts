import say from "say";
import { getGameName } from "../functions";
import { create, getData } from "../JSON/db";
import { BrowserWindow } from "electron";

module.exports = {
	name: "start",
	execute: async (Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		const ActiveGame = await getData("ActiveGame");
		const SetGame = await getData("SetGame");
		const Voice = await getData("Voice");

		if (user.toLowerCase() == settings.twitch.toLowerCase() || user == settings.youtube) {
			if (await getGameName(Args[0]) == undefined){
				say.speak("This game name does not exist in the commands folder. Please make sure the name is spelled correctly.");
				return console.log("Not a game name does not match");
			}

			say.speak("started");
			window.webContents.executeJavaScript(`(() => {
				let curgame = document.getElementById("curgame");
				curgame.innerHTML = "Current Game: ${Args[0]} - ChatPlays Active!";	
			})();`);
			return create({ ActiveGame: Args[0], SetGame, Voice, Theme: await getData("Theme")}, false);
		}

		if (ActiveGame == "" && Math.floor(Math.random() * 100) + 1 == 5) {
			if (SetGame == "") {
				return say.speak(`${user} has activated Chat Plays. However, there was no game set. Unable to activate.`);
			}
			say.speak(`${user} has Activated Chat Plays for: ${SetGame} for 30 seconds.`);
			window.webContents.executeJavaScript(`(() => {
				let curgame = document.getElementById("curgame");
				curgame.innerHTML = "Current Game: ${ActiveGame} - ChatPlays Active!";	
			})();`);
			create({ ActiveGame: SetGame, SetGame, Voice, Theme: await getData("Theme")}, false);
			return setTimeout(async () => {
				say.speak("Deactivating Chat Plays.");
				return create({ ActiveGame: "", SetGame, Voice, Theme: await getData("Theme")}, false)
			}, 30_000); // TODO: Set a dedicated timer inside the game controls instead of hard coded value globally
		}
	}
}