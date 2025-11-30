import {BrowserWindow} from "electron";

function init({ Enable, MessageBus }) {
    const window = BrowserWindow.getAllWindows().find(w => w.title === "API - MineSweeper");
    if (!Enable) {
        if (window) window.close();
        return;
    }
    if (window) {
        window.focus();
        return;
    }


    // TEST
    MessageBus.on("chat_message", ({channel, message}) => {
       console.log("From Plugin", channel, message);
    });
    //

    const game = new BrowserWindow({
        width: 600,
        height: 800,
        show: false,
        frame: false,
        roundedCorners: false,
        resizable: false,
        maximizable: false,
        title: "API - MineSweeper"
    });

    game.show();
}

export const info = {
        author: "AlgorithmicPolicyIndex",
        name: "Mine Sweeper",
        dirName: "MineSweeper",
        description: "Allows Chat to play Mine Sweeper. Can connect to OBS for visual fun!",
        type: "external",
        init: init,
        options: {
            configurable: false,
        }
};