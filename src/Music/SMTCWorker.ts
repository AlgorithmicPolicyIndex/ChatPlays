import {parentPort} from "worker_threads";
import {PlaybackStatus, SMTCMonitor} from "@coooookies/windows-smtc-monitor";
import {NowPlaying} from "./Music";
import * as os from "node:os";
import path from "path";
import * as fs from "node:fs";

const port = parentPort;
if (!port) throw new Error("IllegalState");

port.on("message", async (message) => {
	if (message !== "getCurrentMedia") return;

	const CurrentMedia = SMTCMonitor.getCurrentMediaSession();

	if (!CurrentMedia) {
		port.postMessage({ type: "np" });
		return;
	}

	if (CurrentMedia.playback.playbackStatus == PlaybackStatus.PAUSED)
		return port.postMessage({ type: "np" });

	let result: NowPlaying = {
		Author: CurrentMedia.media.artist,
		Title: CurrentMedia.media.title,
		Position: [
			CurrentMedia.timeline.position * 1000,
			CurrentMedia.timeline.duration * 1000,
		]
	};

	if (CurrentMedia.media.thumbnail) {
		result.Thumbnail = saveToTemp(CurrentMedia.media.thumbnail, CurrentMedia.media.title);
	}

	port.postMessage({ type: "media", result });
});

function saveToTemp(buffer: Buffer, title: string) {
	const tmp = path.join(os.tmpdir(), "ChatPlays");
	if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
	let tmpPath = path.join(tmp, `${title.replace(new RegExp('[<>:"/\|?*]'), "")}.png`);
	try {
		fs.writeFileSync(tmpPath, buffer);
	} catch {
		tmpPath = path.join(__dirname, "placeholder.png");
	}

	return `file://${tmpPath}`;
}
