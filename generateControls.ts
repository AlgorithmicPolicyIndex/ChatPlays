import path from 'path';
import * as fs from 'fs';
import {Key} from '@nut-tree-fork/nut-js'; // Import nut.js

const dir = path.join(__dirname, "src", "games");
const files = fs.readdirSync(dir).filter(file => file.endsWith(".ts"));
type standard = {
	[key: string]: {
		Key?: Key;
		Dir?: string;
		Amt: number;
	}
};
type stratagem = {
	[key: string]: { [key: string]: string }
}
type Game = {
	name: string;
	execute: (message: string) => Promise<void>;
	controls: [standard | stratagem][];
};

class ControlGenerator {
	private text: { Games: string[], [key: string]: any } = { Games: [] };
	private games: Game[] = this.getGames();
	constructor() {
		this.games.forEach(game => {
			this.handleControls(game);
		});
		this.convertToMarkDown();
	}
	
	convertToMarkDown() {
		let text = `# Game Shortcuts\n${this.text.Games.join("  \n")}\n\n`;
		for (const key in this.text) {
			if (key == "Games") continue;

			text += `# ${key == "hd2" ? `${key}\nNote: Stratagem Codes are: I->Up, K->Down, J->Left, L->Right` : key}\n${this.text[key]}\n`;
		}
		fs.writeFileSync("controls.md", text);
	}

	handleControls(game: Game) {
		let text: string = "\n";
		game.controls.forEach((set) => {
			Object.keys(set).forEach(key => {
				const setkey = set[key as keyof [standard | stratagem]];
                if ()

				text += `- ${key}:\n  - ${
					// Handle Keyboard
					typeof setkey == "string" ? `Code: \`${setkey}\`` :
					setkey.Key ? `Key: ${Key[setkey.Key]}, ${
						setkey.Amt == -1 ? "Hold" :
						setkey.Amt == 0 ? "Release" :
						`\`${setkey.Amt}\` Milliseconds`}`
					: // Handle Mouse
					setkey.Dir == "lclick" ? "Left click" : setkey.Dir == "rclick" ? `Right click` :
					setkey.Dir == "toggleRClick" ? "Hold Right Click" :
					setkey.Dir == "sup" ? "Scroll Up" : setkey.Dir == "sdown" ? "Scroll Down" :
					setkey.Amt !== undefined && !setkey.Dir && !setkey.Key ? "Release All Held Keys" :
					`Move Mouse \`${setkey.Dir} ${setkey.Amt}\` pixels`
				}  \n`;
			});
		});
		this.text[game.name] = text;
	}
	
	getGames(): Game[] {
		return files.map((v) => {
			const module = require(path.join(dir, v));
			this.text["Games"].push(`[${module.name}](#${module.name})`);
			return module;
		});
	}
}

new ControlGenerator();