import { BrowserWindow } from "electron";
import Filter from "bad-words";
import extractUrls from "extract-urls";
import childProcess from 'child_process';
import {getData, updateData} from "./JSON/db";
import {services} from './index';
import {OBS} from './Services';
const filter = new Filter();

export async function command(message: string, user: any) {
	const data = await getData();
	const Args = message.toLowerCase().slice(1).split(" ");
	const command = Args.shift();
	const chatWindow = BrowserWindow.getAllWindows().find((win) => win.title == "ChatPlays - Chat");

	switch (command) {
	case "start":
		if (data.playsChance <= Math.floor(Math.random() * 100) + 1 || data.gamePath == "") return;
		
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
		}, data.playtime * 1_000);
	case "voice":
		if (data.voiceChance <= Math.floor(Math.random() * 100) + 1) return;
		if (data.voiceKey == "") return;
		if (data.audio == "none") return;

		const tts = new TTS(1);
		tts.Channel = data.audio;
		return await tts.speak(`${user['display-name']} says: ${message}`);
	case "testsub":
		if (user['username'] !== data.twitchID || !chatWindow) return;
		if (data.popupEvents) {
			console.log("Popup Events");
			await (services.getService("OBS") as OBS).newPopup("Test", "API");
		}
		chatWindow.webContents.send("subscription", Args[0], Args[1]);
	}
}

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
	
	return sanitizedMessage.replace(await extractUrls(sanitizedMessage), "[LINK]");
}

export class TTS {
	readonly baseCommand: string;
	private child: any;
	private channel: string = '';
	constructor(public speed: number) {
		this.speed = speed;
		this.baseCommand = "$speak = New-Object -ComObject SAPI.SPVoice;";
	}

	get Channel(): string {
		return this.channel;
	}

	set Channel(channel: string) {
		this.channel = channel;
	}
	
	listAudioDevices() {
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
		return new Promise<void>((resolve, reject) => {
			const command = this.baseCommand +
				`$speak.AudioOutput = foreach ($o in $speak.GetAudioOutputs()) {if ($o.getDescription() -eq '${this.channel}') {$o; break;}}; ` +
				"$speak.Speak([Console]::In.ReadToEnd());";

			this.child = childProcess.spawn('powershell', [command], { shell: true });
			this.child.stdin.setEncoding('ascii');
			this.child.stdin.end(text);
			this.child.addListener('exit', (code: any, signal: any) => {
				if (code === null || signal !== null) {
					console.log(new Error(`error [code: ${code}] [signal: ${signal}]`));
					reject(new Error(`error [code: ${code}] [signal: ${signal}]`));
				}
				this.child = null;
				resolve();
			});
		});
	}
}
