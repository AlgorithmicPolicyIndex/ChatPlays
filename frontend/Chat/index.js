window.electron.settingsOnLoad(async settings => {
	if (settings.theme !== "default") await changeCSS(settings.theme, settings.name);
	if (settings.Plugins.Enabled.length > 0) {
		for (const plugin of settings.Plugins.Enabled) {
			loadPlugin(plugin);
		}
	}
	Settings = settings;
});

window.electron.getSettings(async function (settings) {
	for (const key in settings) {
		if (Settings[key] === settings[key] || !ValidKeys.includes(key)) continue;
		
		Settings[key] = settings[key];
		switch (key) {
		case "theme":
			await changeCSS(settings[key], settings["name"]);
			continue;
		case "brb":
			brbHandler(settings[key]);
		}
	}
});

window.electron.updateGame(function(name) {
	const curgame = $('#curgame');
	if (name === "") {
		curgame.attr("class", "");
		curgame.text("Current Game: None - ChatPlays Offline");
	} else {
		curgame.attr("class", "active");
		curgame.text(`Current game: ${name} - ChatPlays Online`);
	}
});

window.electron.getMessage(async data => {
	await window.electron.sendID(data.User["user-id"], data.User["username"]);
	const user = data.User;
	let msg = data.Message;
	
	if (data.Platform === "Twitch") {
		let replacements = [];
		const Emotes = user["emotes"];
		if (Emotes) {
			Object.entries(Emotes).forEach(([id, pos]) => {
				const position = pos[0];
				const [start, end] = position.split("-");
				const strToReplace = msg.substring(
					parseInt(start, 10),
					parseInt(end, 10) + 1
				);

				replacements.push({
					strToReplace,
					replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0" alt="">`
				});
			});
		}
		
		if (Settings.otherEmotes && Settings.userId) {
			if (!globalEmotes || !channelEmotes) {
				await fetch(`https://api.betterttv.net/3/cached/emotes/global`).then(async (res) => {
					return globalEmotes = await res.json();
				});
				await fetch(`https://api.betterttv.net/3/cached/users/twitch/${Settings.userId}`).then(async (res) => {
					return channelEmotes = await res.json();
				});
			}

			// ? Global BTTV Emotes
			for (let emote of globalEmotes) {
				strToEmote(msg, emote, replacements);
			}
			// ? Channel BTTV Emotes
			for (let emote of channelEmotes["sharedEmotes"]) {
				strToEmote(msg, emote, replacements);
			}
			for (let emote of channelEmotes["channelEmotes"]) {
				strToEmote(msg, emote, replacements);
			}
		} else if (!checkedID && Settings.userId === "") {
			alert("Unable to use BTTV Emotes, User ID is not set. Please message in your own chat.");
			checkedID = true;
		}
		msg = replacements.reduce(
			(acc, { strToReplace, replacement }) => {
				return acc.split(strToReplace).join(replacement);
			},
			msg
		);
	}

	let blobs = $('ul[id="history"]');
	if (blobs.children().length >= Settings.maxblobs)
		blobs.children().first().remove();
	let blob = $(`li[class="${user["display-name"]}"][id="${count}"]`);
	if (blob.length > 0 && blob.find(".message").length < Settings.maxhistory) {
		let m = $(`<p class="message">${pingMessage(msg)}</p>`);
		return blob.append(m.prop("outerHTML"));
	}
	count++;
	return this.initMsg(user["display-name"], user["mod"], user["badges"]?.broadcaster, JSON.stringify(Settings), msg, data.Platform);
});

function strToEmote(message, emote, replacements) {
	let idx = message.split(" ").indexOf(emote.code);
	if (idx > -1) {
		replacements.push({
			strToReplace: emote.code,
			replacement: `<img src="https://cdn.betterttv.net/emote/${emote.id}/1x" alt="">`
		});
	}
}

window.electron.loadPlugin(function(plugin) {
	return loadPlugin(plugin);
});
function loadPlugin(plugin) {
	if (loadedPlugins[plugin]) return;

	const script = $('<script></script>');
	script.attr("src", `../plugins/${plugin}`);
	$('body').append(script);
	script.onload = () => {
		if (window[plugin] && typeof window[plugin].init === 'function') {
			window[plugin].init();
			loadedPlugins[plugin] = true;
		} else {
			console.error(`Plugin ${plugin} failed to init.`);
		}
	};
}

window.electron.unloadPlugin(function(plugin) {
	if (window[plugin] && window[plugin].observer) {
		window[plugin].observer.disconnect();
		delete window[plugin]
	}

	const script = $(`script[src="../plugins/${plugin}"]`);
	if (!script.length) return;
	
	script.remove();
	delete loadedPlugins[plugin];
	window["loadedPlugins"] = loadedPlugins;
	console.log("Disabled " + plugin);
});

function onThemeChangeComplete() { document.dispatchEvent(new CustomEvent('themeChanged')); }

document.addEventListener('themeChanged', function() {
	if (!Settings.Plugins.Enabled) return;
	for (const plugin of Settings.Plugins.Enabled) {
		if (!window.loadedPlugins[plugin] && typeof window[plugin].init !== 'function') return;
		window[plugin].init();
	}
});

async function changeCSS(theme, channel) {
	const body = $("body");
	for (const ele of body.children()) {
		if (
			$(ele).is("script") && ele.src
			&& (ele.src.includes("index.js")
			|| ele.src.includes("jquery"))
		) continue;
		$(ele).remove();
	}

	$('<script></script>')
		.attr("src", `themes/${theme}/${theme}.js`).appendTo(body);
	window.initTheme(channel);
	// The above overrides the old initTheme, so use this instead of .onload, even though I cringe at this.

	$("#css").replaceWith(
		$("<link rel='stylesheet' type='text/css' id='css'>")
			.attr("href", `themes/${theme}/${theme}.css`)
	);

	onThemeChangeComplete();
}

function brbHandler(brb) {
	let x = $('#brb');
	if (!brb) return x.attr("class", "");
	return x.attr("class", "vis");
}

function pingMessage(msg) {
	const list = msg.split(" ");
	for (const ping of list) {
		if (!ping.includes("@")) continue;
		list[list.indexOf(ping)] = `<span id="ping"><strong>${ping}</strong></span>`;
	}
	return list.join(" ");
}

window.electron.subscription(function (User, Gifter) {
	return this.sub(
		User.length >= 15
			? User.slice(0, -14)
			: User,
		Gifter ? Gifter.length >= 15
			? Gifter.slice(0, -14)
			: Gifter : ""
	);
});
