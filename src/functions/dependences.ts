import {app, dialog} from "electron";
import {exec, execSync} from "node:child_process";

function checkFFMPEG() {
	return exec("ffmpeg -version", (err) => {
		if (err) {
			dialog.showErrorBox("Missing FFMPEG", "https://www.ffmpeg.org/download.html");
			app.quit();
			return;
		}
	});
}

function getPythonVersion(pythonCmd: string) {
	try {
		const versionOutput = execSync(`${pythonCmd} --version`, { encoding: 'utf-8' }).trim();
		const versionMatch = versionOutput.match(/(\d+)\.(\d+)\.(\d+)/);

		if (!versionMatch) return null;

		return {
			major: parseInt(versionMatch[1], 10),
			minor: parseInt(versionMatch[2], 10),
			patch: parseInt(versionMatch[3], 10),
		};
	} catch (error) {
		console.error("Error getting Python version:", error);
		return null;
	}
}

function isVersionLessThan(version: {major: number, minor: number}, target: { major: number, minor: number }) {
	return version.major < target.major || version.minor < target.minor;
}

async function checkPythonVersion() {
	const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
	const pythonVersion = getPythonVersion(pythonCmd);
	if (!pythonVersion) {
		dialog.showErrorBox("Missing Python", "Unable to get a Python version. Python may not be installed. You need version 3.13.X or higher.\nhttps://www.python.org/downloads");
		app.quit();
		return;
	}

	const targetVersion = { major: 3, minor: 12 };
	if (isVersionLessThan(pythonVersion, targetVersion)) {
		dialog.showErrorBox("Python Version Too Low", `Python 3.12.X or higher is required. Your version is ${pythonVersion.major}.${pythonVersion.minor}.${pythonVersion.patch}. Please update Python.`);
		app.quit();
		return;
	}

	const pyDep = ["pydirectinput", "asyncio"];
	const missingDeps = pyDep.filter(dep => {
		const pyPack = execSync(`${pythonCmd} -c "import importlib.util; print(True if importlib.util.find_spec('${dep}') else False)"`, { encoding: "utf8" }).trim();
		return pyPack !== "True";
	});

	if (missingDeps.length > 0) {
		await dialog.showMessageBox({
			title: "Pip install",
			type: "info",
			message: `Installing package(s):\n\n${missingDeps.join(",\n")}`
		});

		const installs = missingDeps.map(dep => {
			const out = execSync(`pip install ${dep == "PIL" ? "pillow" : dep}`, { encoding: "utf8" }).trim();
			if (out.includes("satisfied"))
				return `${dep}: Already Satisfied`;
			else if (out.includes("No Matching Distribution")) {
				return `${dep}: No Matching Distribution`;
			} else if (out.includes("Failed")) {
				return `${dep}: Error installing Package`;
			} else
				return `${dep}: Installed`;
		});

		await dialog.showMessageBox({
			title: "Pip install",
			type: "info",
			message: `${installs.join("\n")}\n\nPlease manually install any failed packages.`
		});
		return;
	}
	return;
}

export { checkFFMPEG, checkPythonVersion };