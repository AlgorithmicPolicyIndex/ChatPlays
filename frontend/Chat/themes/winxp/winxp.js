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
	close_button.setAttribute("id", "close");
	
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
	
	let side_bar_3 = document.createElement("li");
	side_bar_3.setAttribute("class", "liItem");
	side_bar_3.setAttribute("id", "expand");
	side_bar_3.innerHTML = "I want to...";
	let side_bar_3_ul = document.createElement("ul");
	let text = [
		"Invite Someone to this Conversation",
		"Send a File or Photo",
		"Send E-Mail",
		"Ask for Remote Assistance",
		"Make a Phone Call",
		"Start Application Sharing",
		"Start Whiteboard"
	];
	for (let i=1;i<=text.length;i++) {
		let doc = document.createElement("li");
		doc.innerHTML = text[i-1];
		side_bar_3_ul.appendChild(doc);	
	}
	side_bar_3.appendChild(side_bar_3_ul);

	let messageBox = document.createElement("div")
	messageBox.setAttribute("class", "messageBox");
	const history = document.createElement("ul");
	history.setAttribute("id", "history");
	
	let chatBox = document.createElement("div")
	chatBox.setAttribute("class", "chatBox");
	let textarea = document.createElement("textarea");
	let sendButton = document.createElement("button");

	let status_bar = document.createElement("div")
	status_bar.setAttribute("class", "status-bar");
	let status_bar_field = document.createElement("p")
	status_bar_field.setAttribute("class", "status-bar-field");

	let brb = document.createElement("div");
	brb.setAttribute("id", "brb");
	let brb_win = document.createElement("div");
	brb_win.setAttribute("class", "window");
	let brb_body = document.createElement("div");
	brb_body.setAttribute("class", "window-body");
	let brb_text = document.createElement("div");
	brb_text.setAttribute("id", "brb-text");

	let sub = document.createElement("div");
	sub.setAttribute("id", "sub");
	let sub_win = document.createElement("div");
	sub_win.setAttribute("class", "window");
	let sub_body = document.createElement("div");
	sub_body.setAttribute("class", "window-body");
	let sub_text = document.createElement("div");
	sub_text.setAttribute("id", "sub-text");
	let sub_button_yes = document.createElement("button");
	sub_button_yes.setAttribute("id", "sub-button-yes");
	sub_button_yes.innerHTML = "Yes"
	
	let sub_button_no = document.createElement("button");
	sub_button_no.setAttribute("id", "sub-button-no");
	sub_button_no.innerHTML = "No"

	// Structering
	document.body.appendChild(windowelm);
	document.body.appendChild(brb);
	document.body.appendChild(sub);
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
	side_bar_ul.appendChild(side_bar_3);
	
	messageBox.appendChild(history);

	chatBox.appendChild(textarea);
	chatBox.appendChild(sendButton);

	ui.appendChild(recipent);
	ui.appendChild(side_bar);
	ui.appendChild(messageBox);
	ui.appendChild(chatBox);

	status_bar.appendChild(status_bar_field);

	let brb_bar = title_bar.cloneNode(true);
	brb_bar.childNodes[1].childNodes[0].remove();
	brb_bar.childNodes[1].childNodes[0].remove();

	brb_body.appendChild(brb_text);
	brb_win.appendChild(brb_bar);
	brb_win.appendChild(brb_body);
	brb.appendChild(brb_win);

	let sub_bar = title_bar.cloneNode(true);
	sub_bar.childNodes[1].childNodes[0].remove();
	sub_bar.childNodes[1].childNodes[0].remove();
	
	sub_body.appendChild(sub_text);
	sub_body.appendChild(sub_button_yes);
	sub_body.appendChild(sub_button_no);
	sub_win.appendChild(sub_bar);
	sub_win.appendChild(sub_body);
	sub.appendChild(sub_win);


	channel.slice(0,1);
	title_bar_text.innerHTML = channel;
	recipent.innerHTML = `To: ${channel} &lt;${channel.length >= 15 ? "..."+channel.slice(14) : channel}@stream.tv&gt;`;
	side_bar_1.innerHTML ="Start Camera";
	side_bar_2.innerHTML = "Start Talking";
	sendButton.innerHTML = "<u>S</u>end";

	status_bar_field.setAttribute("id", "curgame");
	status_bar_field.innerHTML = "Current Game: None - ChatPlays Offline!";

	// 👌
	brb_bar.childNodes[0].innerHTML = "C:\\ChatPlays has stopped...";
	brb_text.innerHTML = "Be right back!";
	sub_bar.childNodes[0].innerHTML = "Subscription";
	console.log("finished!");
}

async function initMsg(user, mod, broadcaster, settings, message, platform) {
	// ? The whole message blob creation shit
	let historyBlob = document.createElement('li');
	historyBlob.setAttribute("class", user);
	historyBlob.setAttribute("id", `${count}`);
	let name = document.createElement("h2");
	name.setAttribute("id", "name");

	name.innerHTML = `${broadcaster === "1"
		? `<span class='broadcaster'>${user}</span>`
		: mod
			? `<span class='moderator'>${user}</span>`
			: `<span class='chatter'>${user}</span>`} says:`;
	// ? First Message in Blob
	let initMsg = document.createElement("p");
	initMsg.setAttribute("class", "message");
	initMsg.innerHTML = message;

	historyBlob.appendChild(name);
	historyBlob.appendChild(initMsg);

	// ? we have a message! append to list!
	document.getElementById("history").appendChild(historyBlob);
}

async function sub(username, recipent) {
	let x = document.getElementById("sub");
	x.setAttribute("class", "vis");
	if (recipent) {
		x.childNodes[0].childNodes[1].childNodes[0].innerHTML = `Let ${username} run:</br>C:\\users\\${recipent}\\gift.exe?`;
	} else {
		x.childNodes[0].childNodes[1].childNodes[0].innerHTML = `Run:</br>C:\\users\\${username}\\subscription.exe?`;
	}
	setTimeout(() => {
		return x.setAttribute("class", "");
	}, 10_000);
}