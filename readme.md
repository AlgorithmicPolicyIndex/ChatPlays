# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!  
**Have fix the Wiki to be up-to-date**


# Work Load / Plans
 - TWITCH
 	- Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
	- Follower Request (as it's not apart of the API)
 - YOUTUBE
	- Subscribe / Membership Event (not apart of the chat module I use)
 - OVERALL
	- Helldivers Controls
 	- Github file for game controls
		- Fix the controls JSON
 	- Add BunJS internal function support
	- Not a priority
		- 7TV and FFZ Emotes
 - Electron App
	- Plugins
		- For separate overlay functions that can be run in tandem outside of the Theme Developers or Program Scope
 	- THEMES
		- Delete ALL elements from the previous theme just so there is no specific `.remove()` in the InitTheme functions.
		- Correct Dynamic sizing for different window sizes. For now, recommended sizes are:
			- 1440p = 650x959
			- So far that's it, since it was made originally for a 3440x1440 monitor shrunk down to a 1080p stream. Will do more testing and CSS styling.
		- WINXP
			- Make it work correctly with different window sizes.

### Running
> **!** You'll need to edit any thing to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues