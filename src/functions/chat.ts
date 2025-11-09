import childProcess from "child_process";
import extractUrls from "extract-urls";
import Filter from "bad-words";
import {BrowserWindow} from "electron";
import {getData, updateData} from "../JSON/db";
import * as nut from "@nut-tree-fork/nut-js"
import phrases from "../ Phrases.json";

const filter = new Filter();
const domainPattern = new RegExp(
	"\\b[a-zA-Z0-9_-]+\\s*(\\.|\\[\\.]|\\(dot\\)|\\{dot}|\\(\\.\\)|\\[dot]|\\s*dot\\s*|\\s*\\.\\s*)\\s*(com|net|org|xyz|site|io|app|live|store|info|biz)\\b",
	"i"
);

export async function filterWithoutEmojis(message: string) {
	interface CharDetails {
		char: string;
		index: number;
	}

	const specialCharRegex = /[^\p{L}\s]/gu;

	let emojisAndSpecialChars: CharDetails[] = [];
	let sanitizedMessage = message.replace(specialCharRegex, (match, index) => {
		emojisAndSpecialChars.push({ char: match, index });
		return `{specialChar${emojisAndSpecialChars.length - 1}}`;
	});

	sanitizedMessage = filter.clean(sanitizedMessage);

	emojisAndSpecialChars.forEach((item, i) => {
		const specialCharPlaceholder = `{specialChar${i}}`;
		sanitizedMessage = sanitizedMessage.replace(specialCharPlaceholder, item.char);
	});

	sanitizedMessage = phrases.some(phrase => {
		return sanitizedMessage.toLowerCase().includes(phrase.toLowerCase())
	}) ? "[FILTERED]" : sanitizedMessage;

	return sanitizedMessage.replace(await extractUrls(sanitizedMessage), "[LINK]").replace(domainPattern, "[LINK]");
}

export async function command(message: string, user: any) {
	if (!message.startsWith("!")) return;
	const data = await getData();
	const Args = message.toLowerCase().slice(1).split(" ");
	const command = Args.shift();
	const chatWindow = BrowserWindow.getAllWindows().find((win) => win.title == "ChatPlays - Chat");

	switch (command) {
		case "start":
			if (parseInt(data.playsChance) <= Math.floor(Math.random() * 100) + 1 || data.gamePath == "") return;

			const name = data.gamePath.split("\\").filter((string: string) => string.includes(".js") )[0].replace(".js", "");
			if (chatWindow)
				chatWindow.webContents.send("updateGame", name);
			data.ChatPlaysActive = true;
			await updateData(data);

			return setTimeout(async () => {
				if (chatWindow) {
					chatWindow.webContents.send("updateGame", "");
				}
				data.ChatPlaysActive = false;
				await updateData(data);
			}, parseInt(data.playtime) * 1_000);
		case "voice":
			if (process.platform != "win32") return;
			if (parseInt(data.voiceChance) < Math.floor(Math.random() * 100) + 1) return;
			if (data.voiceKey == "") return;
			if (data.audio == "none") return;

			const tts = new TTS(1);
			tts.Channel = data.audio;

			const key = nut.Key[data.voiceKey as keyof typeof nut.Key];
			await nut.keyboard.pressKey(key);
			tts.speak(`${user['display-name']} says: ${Args.join(" ")}`).then(() => {
				nut.keyboard.releaseKey(key);
			});
			return;
	}
}

export class TTS {
	readonly baseCommand: string;
	private child: any;
	private channel: string = '';
	constructor(public speed: number) {
		this.speed = speed;
		this.baseCommand = "$speak = New-Object -ComObject SAPI.SPVoice;";
	}

	set Channel(channel: string) {
		this.channel = channel;
	}

	listAudioDevices() {
		if (process.platform != "win32") return;
		return new Promise((resolve, reject) => {
			let combinedStdout = '';

			const command = this.baseCommand +
				"$speak.GetAudioOutputs() | ForEach-Object { $_.getDescription() };";

			const process = childProcess.exec('powershell -Command "' + command + '"', (error, stdout, stderr) => {
				if (error) {
					reject(`exec error: ${error}`);
					return;
				}
				if (stderr) {
					reject(`stderr: ${stderr}`);
					return;
				}
				combinedStdout += stdout;
			});

			process.on('close', () => {
				try {
					resolve(combinedStdout.trim().split("\n"));
				} catch (e) {
					reject('Error parsing PowerShell output.');
				}
			});
		});
	}

	async speak(text: string) {
		if (process.platform != "win32") return;
		return new Promise<void>((resolve, reject) => {
			const command = this.baseCommand +
				`$speak.AudioOutput = foreach ($o in $speak.GetAudioOutputs()) {if ($o.getDescription() -eq '${this.channel}') {$o; break;}}; ` +
				"$speak.Speak([Console]::In.ReadToEnd());";

			this.child = childProcess.spawn('powershell', [command], { shell: true });
			this.child.stdin.setEncoding('ascii');
			this.child.stdin.end(text);
			this.child.addListener('exit', (code: any, signal: any) => {
				if (code === null || signal !== null) {
					reject(new Error(`error [code: ${code}] [signal: ${signal}]`));
				}
				this.child = null;
				resolve();
			});
		});
	}
}