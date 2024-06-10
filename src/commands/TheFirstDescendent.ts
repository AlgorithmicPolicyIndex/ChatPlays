const { Key } = require("@nut-tree-fork/nut-js");
const { getControls } = require("../ControlHandler");

const controls = {
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

	// Control pressses are done in MS
	shoot: { Dir: "lclick", Amt: 0 },
	aim: { Dir: "toggleRClick", Amt: 0 },
	//#endregion

	//#region | Mechanics
	reload: { Key: Key.R, Amt: 1000 },
	revive: { Key: Key.X, Amt: 2000 },
	grapple: { Key: Key.Num4, Amt: 500 },
	scan: { Key: Key.Tab, Amt: 500 },
	interact: { Key: Key.E, Amt: 4000 },
	skill1: { Key: Key.Q, Amt: 500 },
	skill2: { Key: Key.C, Amt: 500 },
	skill3: { Key: Key.V, Amt: 500 },
	skill4: { Key: Key.Z, Amt: 500 },
	sub: { Key: Key.F, Amt: 500 },
	weapon1: { Key: Key.Num1, Amt: 500 },
	weapon2: { Key: Key.Num2, Amt: 500 },
	weapon3: { Key: Key.Num3, Amt: 500 },

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
	roll: { Key: Key.LeftControl, Amt: -1 },
	sprint: { Key: Key.LeftShift, Amt: -1 },
	//#endregion
};
module.exports = {
	name: "TFD",
	execute: async (message: string) => {
		if (Object.keys(controls).includes(message)) {
			const control = Object.keys(controls);
			getControls(controls[control[control.indexOf(message)] as keyof typeof controls]);
		}
	},
	controls: [ controls ]
};

export {};