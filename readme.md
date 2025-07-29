# Current
**NOTE: THIS IS NOT THE FIRST TIME I MADE THIS UPDATE. I GOT SERIOUSLY LUCKY FOR HAVING SENT A FRIEND ALL MY CODE FOR THIS.**  
This current update is just the base default theme. Please feel free to send any bugs or errors to the Issues page. I expect some song names to cause some problems and will need to be fixed.  
I'm working on the WinXP theme right now. For now though, it will be the default theme.

---

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
    - Music
      - Auto switch theme
      - Make WinXP Theme
    - Services
      - Handle Errors from OBS WebSocket, as it will "connect" if values are inputted, but errors when failed to connect and does not send to app.
    - Voice Chat
       - Test input in games, to make sure full message is heard in game.

### Running

[If you develop but don't know the differences](https://www.youtube.com/watch?app=desktop&v=5LZOk9dt-ko)
Package Managers for people who do not have development environments:
- [NPM](https://nodejs.org/en)
- Yarn: `npm install -g yarn`
- PNPM: `npm install -g pnpm`
- [Bun](https://bun.sh)

Install packages via: `npm install`, `pnpm install`, `bun install`  
AND install [Python](https://www.python.org/downloads/) 

Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`  
The application will check your Python version, if it's above 3.13.X it will [attempt to install `pydirectinput`, if not already installed](https://github.com/AlgorithmicPolicyIndex/ChatPlays/blob/main/src/index.ts#L52-L74).
Those are the only requirements to running the application!

I'm looking into make an .exe file to make running this easier and less of a hassle, but for right now, it's working, make a small change and breaking entirely.  
Expect to not see this .exe file ever.