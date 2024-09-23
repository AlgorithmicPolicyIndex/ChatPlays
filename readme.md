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
	- Not a priority
		- 7TV and FFZ Emotes
 - Electron App
	- Max WxH: 850x1159 | Min WxH: 450x759 - This is due to it being too large or too small. I dont believe other sizes beyond those will be very readible. These were found out by means of WinXP theme testing for dyanmic sizing. You may want to look into doing general sizing via the app window if you wish to read chat from it, then do overlay sizing on OBS directly.
	- Plugins
		- For separate overlay functions that can be run in tandem outside of the Theme Developers or Program Scope

### Running
> **!** You'll need to edit any thing to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues