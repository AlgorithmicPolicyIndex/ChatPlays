import fs from "node:fs";
import path from "path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOptions = {
	delay: 1000,
};

let config;
if (!fs.existsSync(path.join(__dirname, "config.json"))) {
	fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(defaultOptions), "utf8");
	config = defaultOptions;
} else { config = defaultOptions; }

let colors = [
	"red", "orange", "yellow", "green", "blue", "indigo", "violet"
];

let colorIntervals = new Map();

function startEffect(element) {
	let colorIndex = 0;

	if (colorIntervals.has(element)) return;

	element.style.transition = "color 1s ease-in-out";
	let intervalId = setInterval(() => {
		element.style.color = colors[colorIndex];
		colorIndex = (colorIndex + 1) % colors.length;
	}, config.delay);

	colorIntervals.set(element, intervalId);
}

function applyToMsg() {
	let messages = document.querySelectorAll(".message");
	messages.forEach(msg => {
		startEffect(msg);
	});
}

function init() {
	applyToMsg();

	const observer = new MutationObserver(() => {
		applyToMsg();
	});

	observer.observe(document.body, { childList: true, subtree: true });
	
	return observer;
}

export const info = {
		author: "AlgorithmicPolicyIndex",
		name: "Rainbow Messages",
		dirName: "rainbowMessages",
		description: "Give all messages a rainbow color cycle",
		type: "chat",
		init: init,
		options: {
			configurable: true,
		}
};