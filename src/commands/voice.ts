import { BrowserWindow } from "electron";
import { create, getData } from "../JSON/db";
import say from "say";
import { getGames } from "../functions";
import { keyboard } from "@nut-tree-fork/nut-js";

export const name = "voice";
export async function execute(Args: string[], user: any, settings: any, _window: BrowserWindow, _channel: string) {
	const voiceEnabled = await getData("Voice");
	const activegame = await getData("ActiveGame");
	const setgame = await getData("SetGame");

	if (user.toLowerCase() == settings.twitch.toLowerCase() || user == settings.youtube) {
		if (!voiceEnabled) {
			say.speak("Voice Chat Enabled.");
			return await create({ ActiveGame: activegame, SetGame: setgame, Voice: true });
		}
		say.speak("Voice Chat Disabled.");
		return await create({ ActiveGame: activegame, SetGame: setgame, Voice: false });
	}

	if (!voiceEnabled) {
		if (Math.floor(Math.random() * 100)+1 == 5) {
			say.speak("Voice Chat Enabled.");
			await create({ ActiveGame: activegame, SetGame: setgame, Voice: true });
			return setTimeout(async () => {
				await create({ ActiveGame: activegame, SetGame: setgame, Voice: false });
			}, 30_000);
		}
	};

	const VoiceKey = (await getGames(activegame)).VoiceKey;
	const message = `User: ${user} says: ${Args.join(",")}`;
	const dur = estimateDuration(message);

	keyboard.pressKey(VoiceKey);
	say.speak(message);
	setTimeout(() => {
		keyboard.releaseKey(VoiceKey);
	}, dur);
};

function estimateDuration(message: string, WPM: number = 150) {
	const wordCount = message.split(/\s+/).length;
	return (wordCount/WPM) * 60;
}