# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!


# Work Load / Plans
 - TWITCH
 	- Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
 - YOUTUBE
 - OVERALL
	- Helldivers / L4D2 Controls
 	- Github file for game controls
		- Fix the controls JSON
 	- Add BunJS internal function support
	- Mot a priority
		- 7TV and FFZ Emotes
 - Electron App
	- Pop-ups - Followers and the like ?
		- subscription
			- Add funciton in \[theme\].js to handle subscription element window like the BRB
			- Add CSS to \[theme\].css to place the follower popup somewhere else and make closing animation
 	- THEMES
		- WINXP
			- Make it work correctly with different window sizes.

### Running
> **!** You'll need to edit any thing to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues