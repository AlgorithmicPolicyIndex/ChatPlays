import { Glob } from "bun";
import path from "path";
import * as fs from "fs";
import { Key } from "@nut-tree-fork/nut-js";  // Import nut.js

const glob = new Glob("**/games/*.ts");
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
    // Check if the scheme has a "Key" property and its value is a number
    const formattedScheme = Object.fromEntries(
      Object.entries(scheme).map(([key, value]) => {
        // Check if value has a `Key` property and it is a number
        if (value && typeof value === 'object' && 'Key' in value && typeof value.Key === 'number') {
          try {
            // Map the key code to the corresponding key name using nut.js
            value.Key = Key[value.Key];
          } catch (error) {
            console.error(`Error mapping key code: ${value.Key}`, error);
          }
        }
        return [key, value];
      })
    );

    // Use JSON.stringify with indentation
    const formattedJSON = JSON.stringify(formattedScheme, null, 2);
    text += `\n\n# ${game}\n\`\`\`json\n${formattedJSON}\n\`\`\``;
  }
}

fs.writeFileSync("controls.md", text);