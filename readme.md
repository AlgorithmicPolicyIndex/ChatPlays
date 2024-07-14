# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!


# Work Load / Plans
 - TWITCH
 	- Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
 - YOUTUBE
 - OVERALL
	- Fix commands to work with both or either platform.
		- Currently only looks at if platform is twitch, if platform is set to "both" or youtube, it will either break on Twitch commands, or you can only use YOUTUBE.
		- Method to fix: Use the Fake Twitch user structure and have one singular check.
	- Helldivers / L4D2 Controls
 	- Github file for game controls
		- Fix the controls JSON
 	- Add BunJS internal function support
 - Electron App
	- Pop-ups - Followers and the like ?
 	- THEMES
 		- Comes default with WinXP! which has a feature missing, but will be added later when I feel like dealing with CSS again.

### Running
> **!** You'll need to edit any thing to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues