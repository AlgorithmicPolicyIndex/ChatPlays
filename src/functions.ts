import * as path from "path";
import * as fs from "fs";

export async function getGames(name: string, message: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		if (name.toLowerCase() == command.name.toLowerCase()) {
			return command.execute(message.toLowerCase());
		}
	}
}

export async function getGameName(name: string) {
	const cmdPath = path.join(__dirname, "games");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		
		if (name.toLowerCase() == command.name.toLowerCase()) {
			return command.name;
		}
	}
}