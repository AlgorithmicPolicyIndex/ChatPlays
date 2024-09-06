async function initTheme(channel) {
	const history = document.createElement("ul");
	history.setAttribute("id", "history");
	const curgame = document.createElement("div");
	curgame.setAttribute("id", "curgame");
	curgame.setAttribute("style", "color: #e45649;");
	curgame.innerText = "Current Game: None - ChatPlays Offline!";
	const notifications = document.createElement("div");
	notifications.setAttribute("id", "notifications");
	const brb = document.createElement("div");
	brb.setAttribute("id", "brb");
	brb.innerText = "Be right Back!";

	const sub = document.createElement("sub");
	sub.setAttribute("id", "sub");

	document.getElementById("chatWindow").remove();
	document.getElementById("brb").remove();
	document.getElementById("sub").remove();
	document.body.appendChild(history);
	document.body.appendChild(curgame);
	notifications.appendChild(brb);
	notifications.appendChild(sub);
	document.body.appendChild(notifications);

	console.log(channel);
}

async function initMsg(user, mod, broadcaster, settings, message, platform) {
	// ? The whole message blob creation shit
	let historyBlob = document.createElement('li');
	historyBlob.setAttribute("id", user + count);
	historyBlob.setAttribute("style", "border-color: rgb(95, 95, 95);")
	let name = document.createElement("h2");
	name.setAttribute("id", "name");

	name.innerHTML = `${
		broadcaster == "1" 
		? `<span class='broadcaster'>${user}</span>`
		: mod
		? `<span class='moderator'>${user}</span>`
		: `<span class='chatter'>${user}</span>`
	} <span class='channel'>&gt- ${platform}</span>`;
	// ? First Message in Blob
	let initMsg = document.createElement("p");
	initMsg.setAttribute("id", "message");
	initMsg.setAttribute("class", platform);
	initMsg.innerHTML = pingMessage(message);
	
	historyBlob.appendChild(name);
	historyBlob.appendChild(initMsg);
	
	// ? we have a message! append to list!
	document.getElementById("history").appendChild(historyBlob);
}

async function sub(username) {
	let x = document.getElementById("sub");
	x.setAttribute("class", "vis");
	x.innerText = `${username} has subscribed!`;
	setTimeout(() => {
		return x.setAttribute("class", "");
	}, 10_000);
}