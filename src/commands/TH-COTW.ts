import { getControls } from "../ControlHandler";
import { Key } from "@nut-tree/nut-js";

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

	//#region | Mechanics
	phone: { Key: Key.Tab, Amt: 500 },
	holster: { Key: Key.H, Amt: 500 },
	prone: { Key: Key.Z, Amt: 500 },
	crouch: { Key: Key.X, Amt: 500 },
	stand: { Key: Key.X, Amt: 500 },
	whistle: { Key: Key.C, Amt: 500 },
	flashlight: { Key: Key.L, Amt: 500 },
	torch: { Key: Key.L, Amt: 500 },
	interact: { Key: Key.E, Amt: 2000 },
	zoomin: { Dir: "sup", Amt: 20 },
	zoomout: { Dir: "sdown", Amt: 20 },
	// ! I do not like this nomenclature.
	slot1: { Key: Key.Num1, Amt: 500 },
	slot2: { Key: Key.Num2, Amt: 500 },
	slot3: { Key: Key.Num3, Amt: 500 },
	slot4: { Key: Key.Num4, Amt: 500 },
	slot5: { Key: Key.Num5, Amt: 500 },
	slot6: { Key: Key.Num6, Amt: 500 },
	slot7: { Key: Key.Num7, Amt: 500 },
	slot8: { Key: Key.Num8, Amt: 500 },
	slot9: { Key: Key.Num9, Amt: 500 },
	slot10: { Key: Key.Num0 , Amt: 500 },
	//#endregion

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
	jump: { Key: Key.Space, Amt: 500 },
	sprint: { Key: Key.CapsLock, Amt: -1 },
	//#endregion
	// ? Stop; Complete stops all actions. Including Mouse related buttons.
	// ? To iterate on last, this assumes that, in the ControlHandler.ts, the mouse button is in the "HeldKeys" array.
	stop: { Amt: 0 }
};
module.exports = {
	name: "THCOTW",
	execute: async (message: string) => {
		if (Object.keys(Controls).includes(message)) {
			const control = Object.keys(Controls);
			getControls(Controls[control[control.indexOf(message)] as keyof typeof Controls]);
		}
	}
};