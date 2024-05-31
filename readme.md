# ChatPlays
 This is my Twitch Chat Plays code!  
 I usually work on this code on stream, but I mostly refactor offline.

 This program is also a bit more than just Chat Plays though! I personally didn't like the chat overlays offered to me, so I decided to make my own. This code is also a Terminal Chat. I use ANSI for color coding in the terminal, I'll take time out next weekend when I have the chance to make a more stream lined Index.ts file, mostly to make setting your own colors and stuff much easier.

 Note: This program only reads messages in Twitch chat, so it will not type in your channel and requires no permissions to run.

# Terminal Chat (Looking into Message History for better UI Designs, may be changed from Terminal to an Electron App)
 The Terminal Chat with my current settings of the Windows Terminal 
 
 ![chat](chat.png)
 ---
 Moderators look like  
 
 ![mods](mods.png)
 ---

# Chat Plays
 The features of ChatPlays is really anything.  
 All you need to do is make sure your controls are properly set. 

 **Disclaimer: While this is just using the Windows API to do inputs, you may still get banned from games. You shouldn't, as this doesn't hook into games nor give advantage to the player, but I do not know the extent some Devs will go with automated inputs. Example: Helldivers 2 Stratagems. However, that would then disallow the use of Macros/AutoHotKey. You should be fine, but do not come crying to me if you do.**  
 **I only play with people that know about my Code, so there is no hard feelings at the end of the day.**

 You can read over how I handle the general controls of games inside the [Commands Folder](src/commands/)  
 However, what if you wanted to do something custom, say, the [Helldivers 2 Stratagems!](src/commands/Helldivers2.ts)  
 Is there an input you need? You can make it yourself! Otherwise, it should be as streamlined as it needs to be.

 However, I'll let you know how to use the [Control Scheme](src/ControlHandler.ts)... Since I need to rework that soon.
 Right now, there is no obvious way to differentiate between Mouse and Keyboard. Other than Key and Dir

 ```ts
 const Controls = {
	// Keyboard
	walkforward: { Key: nut.Key.W, Amt: -1 }, // Holds Key Down
	stepforward: { Key: nut.Key.W, Amt: 500 }, // Taps key for 500ms before releasing
	stop: { Amt: 0 }, // Releases all held keys

	// Mouse
	lookup: { Dir: "up", Amt: 250 }, // Moves mouse up 250 pixels (Uses Python, because nut.js/robot.js had positioning issues at the time of creation of this project.)
	shoot: { Dir: "lclick", Amt: 500 }, // Presses Left Click
	aim: { Dir: "aim", Amt: 0 }, // Switches between Holding Right Click and releasing
	scrollup: {Dir: "sup", Amt: 500} // Scrolls up 500 "steps"
 }
 ```

 Other than that, that's it! Super Simple right?

# Work Load / Plans
 - Channel Point reward to start for viewers (I'm not affiliated, so that's hard to test)
 - Helldivers Controls
 - Refactor commands for streamer and viewer
 - Electron
	- Fix History Blobs being created when different "prevAuthor" BUT using first Element for user and instead use the most recent/last element from that user
	- Max User/Message count to prevent the scrollbar, mostly to not worry about scrolling and to keep element list to a minimum
	- Add Channel to the list
	- Add the rest of the Colors
 - Github file for game controls
	- Generator file? since all controls are already made.
 

# Setup (WIP)

### Settings
Editing settings is as simple as open the .json in the "src" folder.
Inside it, you will find:
```json
{
	// Main settings
	"streamer": "CHANNEL NAME",
	"processTitle" : "ChatPlaysCMD",

	// Window Size of Terminal
	"width": 441,
	"height": 665,

	// Colors
	// I personally use this site to find the values of colors, you can also use formats such as underscores and more
	// https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06
	"username": "35",
	"moderator": "34",
	"channel": "36",
	"message": "0",
	"bracket": "90"
}
```