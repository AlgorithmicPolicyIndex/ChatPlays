# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!


# Work Load / Plans
 - Major Plan
	- YOUTUBE SUPPORT
		- Has client to work (Needs to be added)
		- Look into chat function to make sure it works across both Twitch and YouTube platforms.
		- Change how the app shows YouTube Messages, as it is focused on Twitch. (Use different classes for Twitch and YouTube Messages)
 - Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
 - Helldivers Controls
 - Electron App
 	- Pop-ups - Followers and the like ?
 - Github file for game controls
	- Fix the controls JSON
 - Add BunJS internal function support
 - Comes default with WinXP! which has a feature missing, but will be added later when I feel like dealing with CSS again.

### Running
> **!** You'll need to edit any thing to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues