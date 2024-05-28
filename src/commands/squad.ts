import { Key } from "@nut-tree/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	//#region | Mouse Controls
	// ! Amount for Mouse controls are in Pixels.
	lightleft: { Dir: "left", Amt: 100 },
	mediumleft: { Dir: "left", Amt: 500 },
	largeleft: { Dir: "left", Amt: 1000 },
	lightright: { Dir: "right", Amt: 100 },
	mediumright: { Dir: "right", Amt: 500 },
	largeright: { Dir: "right", Amt: 1000 },
	lightup: { Dir: "up", Amt: 100 },
	mediumup: { Dir: "up", Amt: 350 },
	largeup: { Dir: "up", Amt: 625 },
	lightdown: { Dir: "down", Amt: 100 },
	mediumdown: { Dir: "down", Amt: 350 },
	largedown: { Dir: "down", Amt: 625 },

	shoot: { Dir: "lclick", Amt: 0 },
	aim: { Dir: "aim", Amt: 0 },
	//#endregion

	// TODO: Mechanics, such as swapping weapons, holding left click for auto fire and long activate items
	// TODO: Etc

	//#region | Movement Controls
	step: { Key: Key.W, Amt: 500 },
	stepback: { Key: Key.S, Amt: 500 },
	stepleft: { Key: Key.A, Amt: 500 },
	stepright: { Key: Key.D, Amt: 500 },
	// ! Special Definitions for keybinds
	walk: { Key: Key.W, Amt: -1 },
	walkback: { Key: Key.A, Amt: -1 },
	walkleft: { Key: Key.A, Amt: -1 },
	walkright: { Key: Key.A, Amt: -1 },
	crouch: { Key: Key.Quote, Amt: -1 },
	sprint: { Key: Key.Backslash, Amt: -1 },
	//#endregion
	// ? Stop; Complete stops all actions. Including Mouse related buttons.
	// ? To iterate on last, this assumes that, in the ControlHandler.ts, the mouse button is in the "HeldKeys" array.
	stop: { Amt: 0 }
};

module.exports = {
	name: "squad",
	execute: async (message: string) => {
		if (Object.keys(Controls).includes(message)) {
			const control = Object.keys(Controls);
			getControls(Controls[control[control.indexOf(message)] as keyof typeof Controls]);
		}
	}
};