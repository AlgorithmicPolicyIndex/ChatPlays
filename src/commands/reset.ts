import { BrowserWindow } from "electron";
import { create } from "../JSON/db";

module.exports = {
	name: "reset",
	execute: async (_Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (
			settings.platform.toLowerCase() == "twitch"
				? user.toLowerCase() == settings.twitch.toLowerCase()
			: user.id == settings.youtube
		) {
			await create({ ActiveGame: "", SetGame: "" }, true);

			if (settings.useChat) {
				window.webContents.executeJavaScript(`(() => {
					let curgame = document.getElementById("curgame");
					curgame.removeAttribute("class");
					curgame.innerHTML = "Current Game: None - ChatPlays Offline!";
				})();
				`);
			}
		}
	}
}