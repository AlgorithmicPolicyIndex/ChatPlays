import * as nut from "@nut-tree-fork/nut-js";
import { getControls } from "../ControlHandler";

const Controls = {
	
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

module.exports = {
	name: "hd2",
	execute: async (message: string) => {
		if (Object.keys(Controls).includes(message.toLowerCase())) {
			const control = Object.keys(Controls);
			getControls(Controls[control[control.indexOf(message.toLowerCase())] as keyof typeof Controls]);
		}
		if (Object.keys(Stratagems).includes(message.toLowerCase())) {
			const stratagem = Object.keys(Stratagems);
			StratagemHandler(Stratagems[stratagem[stratagem.indexOf(message.toLowerCase())] as keyof typeof Stratagems]);
		}
	}
};

async function StratagemHandler(sequence: string) {
	const sseq = sequence.split("");
	const keys = [];
	for (let i = 0; i < sseq.length; i++) {
		switch (sseq[i]) {
		case "i":
			keys.push(nut.Key.W);
			continue;
		case "k":
			keys.push(nut.Key.S);
			continue;
		case "j":
			keys.push(nut.Key.A);
			continue;
		case "l":
			keys.push(nut.Key.D);
			continue;
		}
	}

	nut.keyboard.pressKey(nut.Key.LeftControl);
	for (const key of keys) {
		console.log(key);
		await delay(50);
		nut.keyboard.pressKey(key);
		await delay(50);
		nut.keyboard.releaseKey(key);
		await delay(100);
	}
	nut.keyboard.releaseKey(nut.Key.LeftControl);
}

function delay(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}