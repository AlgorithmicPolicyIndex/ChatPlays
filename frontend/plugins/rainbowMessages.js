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
	}, 1000);

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

// Name and Extension of file
window["rainbowMessages.js"] = { init: init, observer: init() };