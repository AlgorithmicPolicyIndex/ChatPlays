import { Glob } from "bun";
import path from "path";
import * as fs from "fs";

const glob = new Glob("**/commands/*.ts");
let text = "# Games";
const controls = {};
for await (const cmdPath of glob.scan("src")) {
	const command = await import(path.join(__dirname, "src/" + cmdPath));
	
	controls[command.name] = command.controls;
}

for (const key of Object.keys(controls)) {
	text += `  \n[${key}](#${key})`;
}
text += "\n\n### Okay. I'll fix this alright? this is just a bases for now.";

for (const game in controls) {
	for (const scheme of controls[game]) {
		text += `\n\n# ${game}\n\`\`\`json\n${JSON.stringify(scheme)}\n\`\`\``;
	}
}

fs.writeFileSync("controls.md", text);