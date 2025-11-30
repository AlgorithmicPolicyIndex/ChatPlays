# Ackknowledgement
I will attempt to continue working on this project, but come March, maybe earlier, I will be gone, at minimum, for 9 months.

# ChatPlays
Head over to the [Wiki](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki) to read more and specific things about Controls and Settings!  

For those who are wondering about this project, this is created off inspiration of DougDoug and his Chat Plays project.  
I made this in plans of improving my own programming knowledge and having something for my Streams. The Chat Overlay portion of this project, which is my main feature now, was made since I don't like publicly or even pay walled chat overlays. This is also more interesting to me, more unique. As a viewer I think this would be fascinating.  
The other reason I made this a public project is; I didn't want to keep this too myself and since I wrote it as a way to streamline the chatplays idea.  
While DougDoug's project can help teach users Python, my code is meant to be super streamlined, handled for you out of the box, with the extra features like the overlay if you use it. On the other hand, custom controls like Stratagems in Helldivers, can help teach you how to create your own combinations of inputs and learn some Typescript in tandem.

I hope you all enjoy this project I slowly work on as I think of new interesting ideas for my own streams.  
I hope to see what people come up with for features, themes and plugins for the chat overlay!

# Work Load / Plans
  - TWITCH
      - Channel Point rewards
        - Just need to write a path for Channel Point rewards, similar to ChatPlays control files
      - Follower Request (as it's not a part of the API)
        - Chat Bot completed, need to handle follower popup 
  - YOUTUBE
      - Subscribe / Membership Event (not a part of the chat module I use)
  - OVERALL
    - Plugins
      - Config editor
      - scrollable window (for both Plugin and Main window)
      - Complete the rest of the Plugin Types
    - Update the WIKI. Shit's out of date.

### Running
<sup>Note: The best way to get the most up-to-date code is through the normal download of this Repo. The Releases page is not always update as I'm too busy IRL to be working too much on my projects anymore.</sup>

[If you develop but don't know the differences](https://www.youtube.com/watch?app=desktop&v=5LZOk9dt-ko)
Package Managers for people who do not have development environments:
- [NPM](https://nodejs.org/en)
- Yarn: `npm install -g yarn`
- PNPM: `npm install -g pnpm`
- [Bun](https://bun.sh)

Install packages via: `npm install`, `pnpm install`, `bun install`

#### Requirements
[Python](https://www.python.org/downloads/), [FFMPEG](https://www.ffmpeg.org/download.html)

_**IF YOU WANT THE WINXP WEBAMP TO WORK CORRECTLY, YOU WILL NEED TO CREATE A SILENT MP3 IN THE SAME DIR AS THIS README.**_  
This will create a silent mp3 for 300 minutes. You must do this separately.  
`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 18000 silence.mp3`

Edit settings mainly stated inside the [wiki settings](https://github.com/AlgorithmicPolicyIndex/ChatPlays/wiki/Settings#main-settings), such as your Channel Name.  
Run `bun run electron`

The application will check your Python version, if it's above 3.13.X it will [attempt to install `pydirectinput and asyncio`, if not already installed](https://github.com/AlgorithmicPolicyIndex/ChatPlays/blob/main/src/functions/dependences.ts#L52-L75).  
Those are the only requirements to running the application!

### Twitch With Chat Bot ([bot.js](./src/bot.ts))
You will need to either use your own account or a dedicated account.  
Head to https://dev.twitch.tv/console/apps/create and create an application with the redirect URL `https://localhost:3000` with category `Chat Bot`  
Take a copy of the Client ID and Secret and paste it into the [example.env](./secrets/example.env)  
Rename the `example.env` to `.env`

Once both Client ID and Secret are in the `.env`  
You can click connect, you will be prompted with a URL, you'll authorize your account with some scopes.  
The program with automatically receive and edit the .env with the bot access token and refresh token.  
This will be the last time you will ever have to do this, however, if you need to, just delete the access or refresh token and you'll be prompted again.  

Now you can connect to twitch with your bot!