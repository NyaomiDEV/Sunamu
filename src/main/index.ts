import getPlayer, { Player } from "./player";
import { addSongDataCallback, updateInfo } from "./playbackStatus";
import { useElectron, useWebserver } from "./appStatus";
import { updatePresence } from "./integrations/discordrpc";
import Instance from "./instance";
import { convertUncompressed } from "./integrations/lyricsOffline";

export { logToDebug as debug } from "./logger";

process.title = "sunamu";

let player: Player;

async function main(): Promise<void> {
	const instance = new Instance();
	const haveLock = await instance.requestLock();

	if(!haveLock){
		console.error("Another instance is running!");
		return process.exit(1); // for some reason I can't just process.exit because thanks Node on Windows
	}

	let _useWebserver = useWebserver;
	player = await getPlayer();
	player.init(updateInfo);

	if(useElectron){
		try{
			const Electron = await import("./electron");
			await Electron.default();
		}catch(_e){
			console.error("Electron is not available. Perhaps you are using vanilla Node?\nForcing Webserver!");
			_useWebserver = true;
		}
	}

	if(_useWebserver){
		const WebServer = await import("./webserver");
		await WebServer.default();
	}

	addSongDataCallback(async () => {
		updatePresence();
	});

	await convertUncompressed();
}

main();