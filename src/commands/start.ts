import say from "say";
import { getGameName } from "../functions";
import { create, getData } from "../JSON/db";
import { BrowserWindow } from "electron";

module.exports = {
	name: "start",
	excute: async (Args: string[], user: any, settings: any, _window: BrowserWindow, _channel: string) => {
		const ActiveGame = await getData("ActiveGame");
		const SetGame = await getData("SetGame");

		if (user.toLowerCase() == settings.twitch.toLowerCase() || user == settings.youtube) {
			if (await getGameName(Args[0]) == undefined){
				say.speak("This game name does not exist in the commands folder. Please make sure the name is spelled correctly.");
				return console.log("Not a game name does not match");
			}

			say.speak("started");
			return create({ ActiveGame: Args[0], SetGame }, false);
		}

		if (ActiveGame == "" && Math.floor(Math.random() * 100) + 1 == 5) {
			if (SetGame == "") {
				return say.speak(`${user} has activated Chat Plays. However, there was no game set. Unable to activate.`);
			}
			say.speak(`${user} has Activated Chat Plays for: ${SetGame} for 30 seconds.`);
			return create({ ActiveGame: SetGame, SetGame }, false);
		}
		setTimeout(() => {
			say.speak("Deactivating Chat Plays.");
			return create({ ActiveGame: "", SetGame }, false)
		}, 30_000); // TODO: Set a dedicated timer inside the game controls instead of hard coded value globally
	}
}