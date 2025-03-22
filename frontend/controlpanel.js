const Settings = {
	"chatWidth": "650",
	"chatHeight": "959",
	"theme": "default",
	"maxblobs": "10",
	"maxhistory": "5",
	"otherEmotes": false,
	"popupEvents": false,
	"monitor": "0",
	"popupW": "400",
	"popupH": "112",
	"enableChat": true,
	"name": "",
	"brb": false,
	"gamePath": "D:\\Coding_Projects\\ChatPlays\\out\\ChatPlays-win32-x64\\resources\\app.asar\\build\\games\\Destiny2.js",
	"playsChance": "1",
	"playtime": "30",
	"Plugins": {
		"Enabled": [],
		"Disabled": []
	},
	"twitchID": "",
	"userId": "",
	"youtubeID": "",
	"OBSPort": "",
	"OBSPASS": "",
	"audio": "none",
	"voiceKey": "L",
	"voiceChance": "1"
};

let Enabled = [];
let Disabled = [];
$('.close').on('click', function() {
	// Make sure Database has all current updated settings on closure
	$('.setting').each(function() {
		const item = $(this).find("input, select");
		const name = item.attr('name');
		Enabled = [];
		Disabled = [];

		if (item.is(':checkbox')) {
			Settings[name] = item.prop('checked');
		} else if (name.includes("Plugs")) {
			$(item).find("option").each(function() {
				if (this.value === "") return true;
				if (name === "enabledPlugs") {
					Enabled.push(this.value);
				} else if (name === "disabledPlugs") {
					Disabled.push(this.value);
				}
			});
			Settings["Plugins"] = { Enabled, Disabled };
		} else {
			Settings[name] = item.val();
		}
	});
	
	return window.electron.close(Settings);
});

// Live Update Database
$('.setting').on("change", function() {
	const item = $(this).find("input, select");
	const name = item.attr('name');
	let Enabled = Settings.Plugins.Enabled ? [...Settings.Plugins.Enabled] : [];
	let Disabled = Settings.Plugins.Disabled ? [...Settings.Plugins.Disabled] : [];

	if (item.is(':checkbox')) {
		Settings[name] = item.prop('checked');
	} else if (name.includes("Plugs")) {
		$(item).find("option").each(function() {
			if (this.value === "") return true;
			if (name === "enabledPlugs" && !Enabled.includes(this.value)) {
				Enabled.push(this.value);
			} else if (name === "disabledPlugs" && !Disabled.includes(this.value)) {
				Disabled.push(this.value);
			}
		});
		Settings["Plugins"] = { Enabled, Disabled };
	} else {
		Settings[name] = item.val();
	}
	
	return window.electron.UpdateSettings(Settings);
});

window.electron.getSettings(function(settings) {
	console.log(settings);
	if (Object.keys(settings).length === 0) {
		return;
	}

	for (const key of Object.keys(settings)) {
		if (key === "brb") continue;
		
		Settings[key] = settings[key];
		const setting = settings[key];
		const item = $(`input[name="${key}"], select[name="${key}"]`);
		if (item.is(':checkbox')) {
			item.prop('checked', setting);
			if (key === "enableChat") {
				const chat = $('.chat');
				item.prop("checked") ? chat.show() : chat.hide();	
			}
		} else {
			item.val(setting);
		}
	}
});

$('input[name="chatSettings"]').on("click", function() {
	window.electron.createWindow("chatSettings");
});

const userId = Settings.userId;
const userField = $(`input[name="userId"]`);
window.electron.getID(function(id, name) {
	if (userField.val() === userId) return;
	if (name !== $('input[name="twitchID"]').val().toLowerCase()) return;
	Settings.userId = id;
	userField.val(id);
	window.electron.UpdateSettings(Settings);
});

$('.plays').each(function() {
	const game = $(this).find("select");
	const buttons = $(this).find("button");
	buttons.each(function() {
		$(this).on("click", function() {
			if (this.className.includes("start")) {
				window.electron.startstop(game.val(), game[0].options[game[0].selectedIndex].text);
				$(this).prop("disabled", true);
				buttons.filter('.stopPlays').prop("disabled", false);
			} else {
				window.electron.startstop(null, "");
				$(this).prop("disabled", true);
				buttons.filter(".startPlays").prop("disabled", false);
			}
		});
	});
});

let isOpened = false;
$('input[name="spawnChat"]').on("click", function() {
	if (isOpened) {
		isOpened = false;
		$(this).val("Spawn");
	} else { 
		isOpened = true;
		$(this).val("Close");
	}
	window.electron.createWindow("chatWindow")
});

$('input[type="checkbox"]').on("click", function() {
	if ($('input[name="enableChat"]').is(":checked")) {
		$(".chat").show();
	} else {
		$(".chat").hide();
	}
});

const enabledPlugins = $('select[name="enabledPlugs"]');
const disabledPlugins = $('select[name="disabledPlugs"]');
window.electron.pluginsUpdated(function(plugins) {
	for (const plugin of plugins) {
		const existsInEnabled = enabledPlugins.find(`option[value='${plugin}']`).length > 0;
		const existsInDisabled = disabledPlugins.find(`option[value='${plugin}']`).length > 0;

		if (existsInEnabled)
			window.electron.handlePlugin("unload", plugin);

		if (!existsInEnabled && !existsInDisabled)
			if (Settings.Plugins.Enabled.includes(plugin))
				enabledPlugins.append(`<option value='${plugin}'>${plugin}</option>`);
			else
				disabledPlugins.append(`<option value="${plugin}">${plugin}</option>`);
	}
	
	$(".plugins option").each(function() {
		const optionValue = $(this).val();
		if (optionValue && !plugins.includes(optionValue))
			$(this).remove();
	});
	
	enabledPlugins.find("option").length > 1 ? enabledPlugins.prop("disabled", false) : enabledPlugins.prop("disabled", true);
	disabledPlugins.find("option").length > 1 ? disabledPlugins.prop("disabled", false) : disabledPlugins.prop("disabled", true);
});
disabledPlugins.on("change", function() {
	handlePlugins(disabledPlugins, this);
});
enabledPlugins.on("change", function() {
	handlePlugins(enabledPlugins, this);
});

function handlePlugins(menu, obj) {
	const other = menu === disabledPlugins ? enabledPlugins : disabledPlugins;
	const selected = $(obj).find(":selected");
	selected.appendTo(other);

	if (menu === disabledPlugins) {
		// Enabled Plugin
		Settings.Plugins.Disabled = Settings.Plugins.Disabled.filter(plugin => plugin !== selected.val());
		Settings.Plugins.Enabled.push(selected.val());
		window.electron.handlePlugin("load", selected.val());
	} else {
		// Disabled Plugin
		Settings.Plugins.Enabled = Settings.Plugins.Enabled.filter(plugin => plugin !== selected.val());
		Settings.Plugins.Disabled.push(selected.val());
		window.electron.handlePlugin("unload", selected.val());
	}
	
	$(other).prop("disabled", other[0].options.length <= 1);
	$(menu).prop("disabled", menu[0].options.length <= 1);
	
	$(other).val("");
	return $(menu).val("");
}

window.electron.getAudioInputs((i) => {
	for (const input of i) {
		let newInput = document.createElement("option");
		newInput.value = input;
		newInput.text = input;
		$('select[name="audio"]').append(newInput);
	}
});

window.electron.getGameList((games) => {
	for (const game of games) {
		let newInput = document.createElement("option");
		newInput.value = game.Path;
		newInput.text = game.Name;
		$('select[name="gamePath"]').append(newInput);
	}
});

$('.test').on("click", async function() {
	if ($(this).prop("class").includes("gift"))
		return window.electron.test("User1", "User2");
	return window.electron.test("User1");
});

$('.service').on("click", async function() {
	let service = $(this).data("service");
	let connect = $(`.service[data-service="${service}"]:first`);
	let disconnect = $(`.service[data-service="${service}"]:last`);
	let errorMessage = $(`.error-message.${service}`);
	let data = $(`.${service}`);
	let values = data.map((item, element) => $(element).val()).get();

	try {
		let response = await window.electron.handleService(service, values);

		if (response.success) {
			for (let i of data) {
				$(i).prop("disabled", !$(i).prop("disabled"));
			}
			if (connect.prop("disabled") === false) {
				connect.prop('disabled', true);
				disconnect.prop('disabled', false);
				errorMessage.hide();
			} else {
				connect.prop('disabled', false);
				disconnect.prop("disabled", true);
				errorMessage.hide();
			}
		} else {
			errorMessage.show();
		}
	} catch (error) {
		errorMessage.show();
	}
});