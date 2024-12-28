# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!  

For those who are wondering about this project, this is created off inspiration of DougDoug and his Chat Plays project.  
I made this in plans of improving my own programming knowledge and having something for my Streams. The Chat Overlay portion of this project, which is my main feature now, was made since I don't like publicly or even pay walled chat overlays. This is also more interesting to me, more unique. As a viewer I think this would be fascinating.  
The other reason I made this a public project, is I didn't want to keep this too myself and since I wrote it as a way to streamline the chatplays idea.  
While DougDoug's project can help teach users Python, my code is meant to be super streamlined, handled for you out of the box, with the extra features like the overlay if you use it. On the other hand, custom controls like Stratagems in Helldivers, can help teach you how to create your own combinations of inputs and learn some Typescript in tandem.

I hope you all enjoy this project I slowly work on as I think of new interesting ideas for my own streams.  
I hope to see what people come up with for features, themes and plugins for the chat overlay!

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
 - Electron App
	- Max WxH: 850x1159 | Min WxH: 450x759 - This is due to it being too large or too small. I don't believe other sizes beyond those will be very readible. These were found out by means of WinXP theme testing for dyanmic sizing. You may want to look into doing general sizing via the app window if you wish to read chat from it, then do overlay sizing on OBS directly.
	- Look into allowing optional login information for extra features
    - When not using Chat Overlay, create small window with "close gracefully" button, so you don't have to terminate in terminal.

### Running
> **!** You'll need to edit anything to match your package manager, I personally use [Bun](https://bun.sh) **!**

Install packages via `bun i` AND install `python` and run `pip install pydirectinput`  
Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  

There shouldn't be too much issues after that, if there are, feel free to note them in Issues