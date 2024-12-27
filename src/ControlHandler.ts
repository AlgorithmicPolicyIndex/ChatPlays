import * as nut from "@nut-tree-fork/nut-js";
import { PythonShell } from "python-shell";

export function getControls(control: { Dir?: string, Key?: nut.Key, Amt: number }) {
	if (Object.keys(control).includes("Dir")) {
		return MouseHandler(control as { Dir: string, Amt: number });
	}

	return KeyboardHandler(control as { Key: nut.Key, Amt: number });
}

let aiming = 0;

async function MouseHandler(control: { Dir: string, Amt: number}) {
	switch (control.Dir) {
	case "lclick":
		await nut.mouse.pressButton(nut.Button.LEFT);
		setTimeout(() => {
			nut.mouse.releaseButton(nut.Button.LEFT);
		}, control.Amt);
		return;
	case "rclick":
		await nut.mouse.pressButton(nut.Button.RIGHT);
		setTimeout(() => {
			nut.mouse.releaseButton(nut.Button.RIGHT);
		}, control.Amt);
		return;
	case "toggleRClick":
		if (aiming == 0) {
			aiming = 1;
			await nut.mouse.pressButton(nut.Button.RIGHT);
		} else {
			aiming = 0;
			await nut.mouse.releaseButton(nut.Button.RIGHT);
		}
		return;
	case "sup":
		await nut.mouse.scrollUp(control.Amt);
		return;
	case "sdown":
		await nut.mouse.scrollDown(control.Amt);
		return;
	default: // ! This is used for the hacky python handler, so I can just have on instance of it
		// ! This handles the up, down, left, right movements of the mouse
		// ! I'm doing this, because of the way the offset works in PythonDirectInput.
		// ! Nut.Js and ultimately Robot.js have a position issue, where it doesn't take note of snap in games. which has a jarring/null effect to the camera movement.
		await PythonShell.run("python/mouse.py", { args: [control.Dir, `${control.Amt}`]});
		return;
	}
}

let heldKeys: nut.Key[] = [];
async function KeyboardHandler(control: { Key: nut.Key, Amt: number }) {
	switch (control.Amt) {
	case -1:
		heldKeys.push(control.Key);
		await nut.keyboard.pressKey(control.Key);
		return;
	case 0:
		for (const key of heldKeys) {
			await nut.keyboard.releaseKey(key);
		}
		heldKeys = [];
		return;
	default:
		await nut.keyboard.pressKey(control.Key);
		await delay(control.Amt);
		await nut.keyboard.releaseKey(control.Key);
		return;
	}
}

function delay(milliseconds: number){
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}