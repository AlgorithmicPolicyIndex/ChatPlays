# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!

# Work Load / Plans
 - TWITCH
 	- Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
	- Follower Request (as it's not a part of the API)
 - YOUTUBE
	- Subscribe / Membership Event (not a part of the chat module I use)
 - OVERALL
   - Allow Chat to Interact with Game Voice Chat.
       - Need to figure out virtual microphone input or hooking. Such as Steel Series Sonar Aux or other channels.
       - You can add via "export const VoiceKey = Key.V;" inside your game files. Check [Destiny2](./src/games/Destiny2.ts) for an example.
       - You can't manually start VC via command, if you want to test it or start it yourself, please enter the [Settings.json](./JSON/settings.json) and change `Voice = false` to true.
   - Not a priority
       - 7TV and FFZ Emotes
   - Graceful exit of process and disconnect from services.
   - Wiki, acknowledge new settings and instructions.
 - Electron App
	- Max WxH: 850x1159 | Min WxH: 450x759 - This is due to it being too large or too small. I dont believe other sizes beyond those will be very readible. These were found out by means of WinXP theme testing for dyanmic sizing. You may want to look into doing general sizing via the app window if you wish to read chat from it, then do overlay sizing on OBS directly.
	- Look into allowing optional login information for extra features

### Running
> **!** You'll need to edit anything to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues