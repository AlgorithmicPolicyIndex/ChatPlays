async function initTheme(channel) { 
	const history = document.getElementById("history");
	const curgame = document.createElement("div");
	curgame.setAttribute("id", "curgame");
	curgame.setAttribute("style", "color: #e45649;");
	curgame.innerText = "Current Game: None - ChatPlays Offline!";
	const notifications = document.createElement("div");
	notifications.setAttribute("id", "notifications");
	const brb = document.createElement("div");
	brb.setAttribute("id", "brb");
	brb.innerText = "Be right Back!";

	document.getElementById("chatWindow").remove();
	document.body.appendChild(history);
	document.body.appendChild(curgame);
	notifications.appendChild(brb);
	document.body.appendChild(notifications);

	console.log(channel);
}