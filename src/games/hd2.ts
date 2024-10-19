import { Key, keyboard } from "@nut-tree-fork/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	walk: { Key: Key.W, Amt: -1},
	walkleft: { Key: Key.A, Amt: -1 },
	walkright: { Key: Key.D, Amt: -1 },
	walkback: { Key: Key.S, Amt: -1 },
	step: { Key: Key.W, Amt: 500 },
	stepleft: { Key: Key.A, Amt: 500 },
	stepright: { Key: Key.D, Amt: 500 },
	stepback: { Key: Key.S, Amt: 500 },
	dive: { Key: Key.LeftAlt, Amt: 100 },
	melee: { Key: Key.F, Amt: 100 },
	crouch: { Key: Key.C, Amt: 100 },
	jump: { Key: Key.Space, Amt: 1000 },
	aim: { Dir: "toggleRClick", Amt: 0 },

	primary: { Key: Key.Num1, Amt: 100 },
	secondary: { Key: Key.Num2, Amt: 100 },
	power: { Key: Key.Num3, Amt: 100 },

	fire: { Dir: "lclick", Amt: 0 },
	burst: { Dir: "lclick", Amt: 1000 },
	quafire: { Dir: "lclick", Amt: 5000 },
	reload: { Key: Key.R, Amt: 50 },
	grenade: { Key: Key.G, Amt: 100 },
	stim: { Key: Key.V, Amt: 100 },

	lookup: { Dir: "up", Amt: 500 },
	lookdown: { Dir: "down", Amt: 500 },
	lookright: { Dir: "right", Amt: 500 },
	lookleft: { Dir: "left", Amt: 500 },
	lightlookup: { Dir: "up", Amt: 100 },
	lightlookdown: { Dir: "down", Amt: 100 },
	lightlookright: { Dir: "right", Amt: 100 },
	lightlookleft: { Dir: "left", Amt: 100 }
};
const Stratagems = {
	// Support Weapons
	mg: "kjkil",
	amrifle: "kjlik",
	stalwart: "kjkiij",
	expendat: "kkjil",
	recoilless: "kjllj",
	flamethrower: "kjiki",
	autocannon: "kjkiil",
	hmg: "kjikk",
	airburst: "kiijl",
	railgun: "klkijl",
	spear: "kkikk",

	// Orbital
	orbgatling: "lkjii",
	orbairburst: "lll",
	he120: "llkjlk",
	he380: "lkiijkk",
	walking: "lklklk",
	orblaser: "lkilk",
	orbrailgun: "likkl",

	// Hanger
	strafing: "ill",
	airstrike: "ilkl",
	cluster: "ilkkl",
	napalm: "ilki",
	jumppack: "kiiki",
	smoke: "ilik",
	rocketpod: "ilij",
	bomb500: "ilkkk",

	// Bridge
	percision: "lli",
	gas: "llkl",
	ems: "lljk",
	orbsmoke: "llki",
	hmgplace: "kijllj",
	shieldgen: "kijkll",
	tesla: "kilijl",

	// Engineering Bay
	apmine: "kjil",
	supplypack: "kjkiik",
	glauncher: "kjijk",
	lasercannon: "kjkij",
	incenmines: "kjjk",
	dogrover: "kijill",
	shield: "kjiil",
	arcthrower: "klkijj",
	quasar: "kkijl",
	shieldpack: "kijljl",

	// Robotics
	mgsentry: "killi",
	gatlingsen: "kilj",
	mortarsen: "killk",
	guarddog: "kijilk",
	autocansen: "kiliji",
	rocketsen: "killj",
	emssentry: "kilkl",
	exosuit: "jklijkk",

	// Mission Strats
	reinforce: "iklji",
	sos: "ikli",
	resupply: "kkil",
	superearth: "kiki",
	upload: "jliii",
	hellbomb: "kijkilki"
};

// TODO: Make handler for changing flashlight, RPM and zoom levels.
const name = "hd2";
const execute = async (message: string) => {
	if (Object.keys(Controls).includes(message.toLowerCase())) {
		const control = Object.keys(Controls);
		getControls(Controls[control[control.indexOf(message.toLowerCase())] as keyof typeof Controls]);
	}
	if (Object.keys(Stratagems).includes(message.toLowerCase())) {
		const stratagem = Object.keys(Stratagems);
		StratagemHandler(Stratagems[stratagem[stratagem.indexOf(message.toLowerCase())] as keyof typeof Stratagems]);
	}
}
const controls = [ Controls, Stratagems ];

export {name, execute, controls}

async function StratagemHandler(sequence: string) {
	const sseq = sequence.split("");
	const keys = [];
	for (let i = 0; i < sseq.length; i++) {
		switch (sseq[i]) {
		case "i":
			keys.push(Key.W);
			continue;
		case "k":
			keys.push(Key.S);
			continue;
		case "j":
			keys.push(Key.A);
			continue;
		case "l":
			keys.push(Key.D);
			continue;
		}
	}

	keyboard.pressKey(Key.LeftControl);
	for (const key of keys) {
		await delay(50);
		keyboard.pressKey(key);
		await delay(50);
		keyboard.releaseKey(key);
		await delay(100);
	}
	keyboard.releaseKey(Key.LeftControl);
}

function delay(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}