import { FileHandle, mkdir, open } from "fs/promises";
import { checkFunctionality } from "../appStatus";
import { addConfigChangedCallback, get as getConfig } from "../config";
import { songdata } from "../playbackStatus";
import { resolve } from "path";
import { getAppData } from "../util";
import { debug } from "../";
import { EOL } from "os";

const sessionDate = new Date();
const sessionFileName = `sunamu-tracklog-${sessionDate.getFullYear()}${String(sessionDate.getMonth() + 1).padStart(2, "0")}${String(sessionDate.getDate()).padStart(2, "0")}-${String(sessionDate.getHours()).padStart(2, "0")}${String(sessionDate.getMinutes()).padStart(2, "0")}${String(sessionDate.getSeconds()).padStart(2, "0")}.txt`;

export let trackLogActive = getTrackLoggerConfig();
export function setTrackLogActive(value: boolean){
	trackLogActive = value;
}

addConfigChangedCallback(async () => {
	trackLogActive = getTrackLoggerConfig();
	await handleFile();
});

function getTrackLoggerConfig() {
	const _active = Object.assign({}, getConfig<boolean>("logPlayedTracksToFile"));
	return checkFunctionality(_active, "log-tracks");
}

let fileHandle: FileHandle | undefined;

async function handleFile(){
	if(!trackLogActive) {
		if(fileHandle){
			await fileHandle.close();
			fileHandle = undefined;
		}
		return;
	}

	if(!fileHandle){
		try{
			await mkdir(resolve(getAppData(), "sunamu", "tracklogs"), { recursive: true });
			fileHandle = await open(resolve(getAppData(), "sunamu", "tracklogs", sessionFileName), "a");
		}catch(e){
			debug("Cannot open file for logging");
		}
	}

}

export async function logTrack() {
	await handleFile();

	if (!trackLogActive || !songdata || !songdata.metadata.id)
		return;

	if(!fileHandle)
		return; // error

	debug("Logging track");
	const now = new Date();
	const nowFormat = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}.${String(now.getSeconds()).padStart(2, "0")}`;
	const line = `[${nowFormat}] ${songdata.metadata.artist ?? "Unknown artist"} - ${songdata.metadata.title ?? "Unknown track"}`;

	await fileHandle?.appendFile(line + EOL, "utf-8");
}
