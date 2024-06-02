import { Key } from "@nut-tree-fork/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	movup: { Key: Key.W, Amt: 500 },
	movdown: { Key: Key.S, Amt: 500 },
	movleft: { Key: Key.A, Amt: 500 },
	movright: { Key: Key.D, Amt: 500 },

	accept: { Dir: "lclick", Amt: 500 },
	interact: { Dir: "lclick", Amt: 500 },
	click: { Dir: "lclick", Amt: 500 },
	skip: { Dir: "rclick", Amt: 500 },

	up: { Dir: "up", Amt: 500 },
	down: { Dir: "down", Amt: 500 },
	left: { Dir: "left", Amt: 500 },
	right: { Dir: "right", Amt: 500 },

	pause: { Key: Key.Escape, Amt: 500 }
};

module.exports = {
	name: "heartbound",
	execute: async (message: string) => {
		if (Object.keys(Controls).includes(message)) {
			const control = Object.keys(Controls);
			getControls(Controls[control[control.indexOf(message)] as keyof typeof Controls]);
		}
	}
};