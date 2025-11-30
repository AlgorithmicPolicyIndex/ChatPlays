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
	"Plugins": [],
	"twitchID": "",
	"userId": "",
	"youtubeID": "",
	"OBSPort": "",
	"OBSPASS": "",
	"audio": "none",
	"voiceKey": "L",
	"voiceChance": "1",
    "usePython": false,
};

$('.close').on('click', function() {
	// Make sure Database has all current updated settings on closure
	$('.setting').each(function() {
		const item = $(this).find("input, select");
		const name = item.attr('name');

		if (item.is(':checkbox')) {
			Settings[name] = item.prop('checked');
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

	if (item.is(':checkbox')) {
		Settings[name] = item.prop('checked');
	} else {
		Settings[name] = item.val();
	}

    return window.electron.UpdateSettings(Settings);
});

function handleSettings(settings) {
    if (!settings || Object.keys(settings).length === 0)
        return;

    for (const key of Object.keys(settings)) {
        if (key === "brb")
            continue;

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
}

window.electron.getSettings(function(settings) {
    handleSettings(settings);
});

// Fallback: actively fetch settings on load in case the initial IPC event was missed
(async function() {
	try {
		if (!window.electron.getSettingsAsync) return;
		const settings = await window.electron.getSettingsAsync();
		handleSettings(settings);
	} catch (e) {
		console.error(e);
	}
})();

$('input[name="chatSettings"]').on("click", function() {
	window.electron.createWindow("chatSettings");
});

window.electron.getID(function(id) {
    $(`input[name="userId"]`).val(id);
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

let windows = []
$('input[name="spawnChat"]').on("click", function() {
	if (windows.includes("chat")) {
		windows.splice(windows.indexOf("chat"), 1);
		$(this).val("Spawn");
	} else { 
		windows.push("chat");
		$(this).val("Close");
	}
	window.electron.createWindow("chatWindow")
});
$(`input[name="spawnMusic"]`).on("click", function() {
	if (windows.includes("music")) {
		windows.splice(windows.indexOf("music"), 1);
		$(this).val("Spawn");
	} else {
		windows.push("music");
		$(this).val("Close");
	}
	window.electron.createWindow("musicWindow");
});

$('input[type="checkbox"]').on("click", function() {
	if ($('input[name="enableChat"]').is(":checked")) {
		$(".chat").show();
	} else {
		$(".chat").hide();
	}
});

$('input[name="spawnPlugins"]').on("click", function() {
	return window.electron.createWindow("pluginWindow");
});

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

	let values = data.map((index, element) => {
		const $el = $(element);

		if ($el.is(':checkbox')) {
			return $el.is(':checked');
		}

		return $el.val();
	}).get();

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