import { Key } from "@nut-tree-fork/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	step: { Key: Key.W, Amt: 500 },

	lookleft: { Dir: "left", Amt: 1000 },
	lookright: { Dir: "right", Amt: 1000 }
};

module.exports = {
	name: "l4d2",
	execute: async (message: string) => {
		if (Object.keys(Controls).includes(message)) {
			const control = Object.keys(Controls);
			getControls(Controls[control[control.indexOf(message)] as keyof typeof Controls]);
		}
	},
	controls: [ Controls ]
};