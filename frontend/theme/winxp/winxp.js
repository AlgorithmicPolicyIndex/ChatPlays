/*
	Windows XP based theme
	! Note:
	! This theme has a lot of values that may not work with different Resolutions.
	! I'm not a FrontEnd Developer. so there's alot of hard typing and it only looks similar to Windows Messenger
	! For example, the side bar does not look the same, at all. but it works for what I wanted, it doesn't have to be exact.

	! Note:
	* This file is more showing what the JS file should look like. Mainly function wise, since your code will vary.
*/

async function initTheme(channel) { // Make required elements and structure for theme to work
	// Remove unneeded items
	document.getElementById("curgame").remove();
	document.getElementById("notifications").remove();

	// Elements
	let windowelm = document.createElement("div");
	windowelm.setAttribute("class", "window");
	windowelm.setAttribute("id", "chatWindow");
	
	let title_bar = document.createElement("div")
	title_bar.setAttribute("class", "title-bar");
	let title_bar_text = document.createElement("div")
	title_bar_text.setAttribute("class", "title-bar-text");
	let title_bar_controls = document.createElement("div")
	title_bar_controls.setAttribute("class", "title-bar-controls");
	let minimize_button = document.createElement("button")
	minimize_button.setAttribute("aria-label", "Minimize");
	let maximize_button = document.createElement("button")
	maximize_button.setAttribute("aria-label", "Maximize");
	let close_button = document.createElement("button")
	close_button.setAttribute("aria-label", "Close");
	
	let window_body = document.createElement("div")
	window_body.setAttribute("class", "window-body");
	let ui = document.createElement("div")
	ui.setAttribute("class", "ui");
	let recipent = document.createElement("div")
	recipent.setAttribute("id", "recipent");
	let side_bar = document.createElement("div")
	side_bar.setAttribute("id", "sidebar");
	let side_bar_ul = document.createElement("ul");
	let side_bar_1 = document.createElement("li")
	side_bar_1.setAttribute("class", "liItem");
	let side_bar_2 = document.createElement("li")
	side_bar_2.setAttribute("class", "liItem");
	let messageBox = document.createElement("div")
	messageBox.setAttribute("class", "messageBox");
	let history = document.getElementById("history");
	
	let chatBox = document.createElement("div")
	chatBox.setAttribute("class", "chatBox");
	let textarea = document.createElement("textarea");
	let sendButton = document.createElement("button");

	let status_bar = document.createElement("div")
	status_bar.setAttribute("class", "status-bar");
	let status_bar_field = document.createElement("p")
	status_bar_field.setAttribute("class", "status-bar-field");

	// Structering
	// TODO: Find out why title_bar is undefined and not appending
	document.body.appendChild(windowelm);
	windowelm.appendChild(title_bar);
	windowelm.appendChild(window_body);
	windowelm.appendChild(status_bar);
	window_body.appendChild(ui)


	title_bar.appendChild(title_bar_text);
	title_bar.appendChild(title_bar_controls);
	title_bar_controls.appendChild(minimize_button);
	title_bar_controls.appendChild(maximize_button);
	title_bar_controls.appendChild(close_button);

	side_bar.appendChild(side_bar_ul);
	side_bar_ul.appendChild(side_bar_1);
	side_bar_ul.appendChild(side_bar_2);
	
	messageBox.appendChild(history);

	chatBox.appendChild(textarea);
	chatBox.appendChild(sendButton);

	ui.appendChild(recipent);
	ui.appendChild(side_bar);
	ui.appendChild(messageBox);
	ui.appendChild(chatBox);

	status_bar.appendChild(status_bar_field);

	channel.slice(0,1);
	title_bar_text.innerHTML = "Twitch Chat";
	recipent.innerHTML = `To: ${channel} &lt;${channel.length >= 15 ? "..."+channel.slice(14) : channel}@twitch.tv&gt;`;
	side_bar_1.innerHTML ="Start Camera";
	side_bar_2.innerHTML = "Start Talking";
	sendButton.innerHTML = "<u>S</u>end";

	status_bar_field.setAttribute("id", "curgame");
	status_bar_field.innerHTML = "Current Game: None - ChatPlays Offline!";
	console.log("finished!");
}