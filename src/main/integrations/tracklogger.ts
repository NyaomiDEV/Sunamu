import { FileHandle, mkdir, open } from "fs/promises";
import { checkFunctionality } from "../appStatus";
import { addConfigChangedCallback, get as getConfig } from "../config";
import { songdata } from "../playbackStatus";
import { resolve } from "path";
import { getAppData } from "../util";
import { debug } from "../";
import { EOL } from "os";

export let trackLogActive = getTrackLoggerConfig();
export const trackLogUTC = getTrackLoggerUTCConfig(); // not definable at runtime for consistency
export const trackLogPath = getFilePath();

addConfigChangedCallback(async () => {
	trackLogActive = getTrackLoggerConfig();
	await handleFile();
});

export function setTrackLogActive(value: boolean){
	trackLogActive = value;
	handleFile();
}

function getTrackLoggerConfig() {
	const _active = getConfig<boolean>("logPlayedTracksToFile");
	return checkFunctionality(_active, "log-tracks");
}

function getTrackLoggerUTCConfig() {
	const _active = getConfig<boolean>("logPlayedTracksUTCTimestamps");
	return checkFunctionality(_active, "log-tracks-in-utc");
}

function getFilePath(){
	const sessionDate = new Date();
	let sessionDateFormat: string;
	if (trackLogUTC)
		sessionDateFormat = `UTC-${sessionDate.getUTCFullYear()}${String(sessionDate.getUTCMonth() + 1).padStart(2, "0")}${String(sessionDate.getUTCDate()).padStart(2, "0")}-${String(sessionDate.getUTCHours()).padStart(2, "0")}${String(sessionDate.getUTCMinutes()).padStart(2, "0")}${String(sessionDate.getUTCSeconds()).padStart(2, "0")}`;
	else
		sessionDateFormat = `${sessionDate.getFullYear()}${String(sessionDate.getMonth() + 1).padStart(2, "0")}${String(sessionDate.getDate()).padStart(2, "0")}-${String(sessionDate.getHours()).padStart(2, "0")}${String(sessionDate.getMinutes()).padStart(2, "0")}${String(sessionDate.getSeconds()).padStart(2, "0")}`;
	const sessionFileName = `sunamu-tracklog-${sessionDateFormat}.txt`;

	return resolve(getAppData(), "sunamu", "tracklogs", sessionFileName);
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
			fileHandle = await open(trackLogPath, "a");
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

	const now = new Date();
	let nowFormat: string;
	if(trackLogUTC)
		nowFormat = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}.${String(now.getUTCSeconds()).padStart(2, "0")}`;
	else
		nowFormat = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}.${String(now.getSeconds()).padStart(2, "0")}`;
	const line = `[${nowFormat}] ${songdata.metadata.artist ?? "Unknown artist"} - ${songdata.metadata.title ?? "Unknown track"}`;
	debug("Logging track", `"${songdata.metadata.artist} - ${songdata.metadata.title}"`);

	await fileHandle?.appendFile(line + EOL, "utf-8");
}
