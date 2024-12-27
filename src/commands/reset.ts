import { BrowserWindow } from "electron";
import { create, getData } from "../JSON/db";

module.exports = {
	name: "reset",
	execute: async (_Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		const Voice = await getData("Voice");
		if (user.toLowerCase() == settings.twitch.toLowerCase() || user == settings.youtube) {
			await create({ ActiveGame: "", SetGame: "", Voice, Theme: await getData("Theme")}, true);

			if (settings.useChat) {
				await window.webContents.executeJavaScript(`(() => {
					let curgame = document.getElementById("curgame");
					curgame.removeAttribute("class");
					curgame.innerHTML = "Current Game: None - ChatPlays Offline!";
				})();
				`);
			}
		}
	}
}