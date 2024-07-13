import say from "say";
import { getGameName } from "../functions";
import { BrowserWindow } from "electron";
import { create, getData } from "../JSON/db";

module.exports = {
	name: "set",
	execute: async (Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (user["display-name"].toLowerCase() == settings.twitch.toLowerCase() || user.id.toLowerCase() == settings.youtube.toLowerCase()) {
			if (await getGameName(Args[0]) == undefined){
				say.speak("This game name does not exist in the commands folder. Please make sure the name is spelled correctly.");
				return console.log("Not a game name does not match");
			}

			await create({ ActiveGame: "", SetGame: Args[0] }, true);
			const SetGame = await getData("SetGame");
			say.speak(`Game has been set to: ${SetGame}`, "voice_kal_diphone");

			if (settings.useChat) {
				window.webContents.executeJavaScript(`(() => {
					let curgame = document.getElementById("curgame");
					curgame.setAttribute("class", "active");
					curgame.innerHTML = "Current Game: ${SetGame} - ChatPlays Active!";
				})();
				`);
			}
		}
	}
}