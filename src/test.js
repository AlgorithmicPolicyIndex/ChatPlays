const nut = require("@nut-tree-fork/nut-js");
const request = require("request");

async function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log("Center Screen. Mouse movement based on mouse relative position.");
    await nut.mouse.move(nut.straightTo(new nut.Point(await nut.screen.width()/2, await nut.screen.height()/2)));
    await moveMouse();

	console.log("Finished Testing...");
	process.exit(0);
})();

async function moveMouse() {
    const oldPosition = await nut.mouse.getPosition();
    await nut.mouse.move(nut.straightTo(new nut.Point(oldPosition.x+5, oldPosition.y+10)));
    await delay(500);
    await nut.mouse.move(nut.straightTo(new nut.Point(oldPosition.x-15, oldPosition.y-2)));
    await delay(500);
    await nut.mouse.move(nut.straightTo(new nut.Point(oldPosition.x, oldPosition.y+3)));
    await delay(500);

}

const url = "https://api.twitch.tv/helix/channels/followers?broadcaster_id=236613377";

function getFollowers() {
    return new Promise((resolve, reject) => {
        request({ url, json: true }, (error, response, body) => {
            if (error) reject(error);

            console.log(body);

            const followers = body.follows.map(follower => {
                return { id: follower.user._id, name: follower.user.name };
            });
            resolve(followers);
        });
    });
}

console.log(getFollowers()[0]);