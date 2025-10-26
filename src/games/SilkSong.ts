import { Key } from "@nut-tree-fork/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	// * Movement
	up: { Key: Key.Up, Amt: 500 },
	down: { Key: Key.Down, Amt: 500 },
	left: { Key: Key.Left, Amt: 500 },
	right: { Key: Key.Right, Amt: 500 },
	jump: { Key: Key.Space, Amt: 750 },
	sprint: { Key: Key.C, Amt: -1 },

	// * Attacking
	harpoon: { Key: Key.S, Amt: 500 },
	needolin: { Key: Key.D, Amt: 500 },
	attack: { Key: Key.X, Amt: 500 },

	// * Others
	bind: { Key: Key.A, Amt: 1500 },
	heal: { Key: Key.A, Amt: 1500 },
	inventory: { Key: Key.I, Amt: 500 },
	Map: { Key: Key.M, Amt: 5000 },
	crest: { Key: Key.Q, Amt: 500 },
	skill: { Key: Key.F, Amt: 500 },
	tool: { Key: Key.F, Amt: 500 },
	challenge: { Key: Key.V, Amt: 500 },
	journal: { Key: Key.J, Amt: 500 },
	tasks: { Key: Key.T, Amt: 500 },
	stop: { Amt: 0 }
};

// TODO: Directional Attacks

const name = "Silksong";
const execute = async (message: string) => {
	if (Object.keys(Controls).includes(message)) {
		const controlKeys = Object.keys(Controls);
		await getControls(Controls[controlKeys[controlKeys.indexOf(message)] as keyof typeof Controls]);
	}
}
const controls = [ Controls ];
export { name, execute, controls };