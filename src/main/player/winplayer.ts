import { Update } from "../../types";
// @ts-ignore
import Player from "winplayer-node";
import { basename, extname } from "path";
let _player;

export async function init(callback: Function): Promise<void>{
	_player = new Player(callback);
}

export async function getUpdate(): Promise<Update | null> {
	const update: Update = await _player.getUpdate();

	// Remove the trailing extension on app names
	if(update.app === update.appName) // Win32 app or otherwise app without registered AUMID
		update.appName = basename(update.appName, extname(update.appName));

	return update;
}

export function Play() {
	return _player.Play();
}

export function Pause() {
	return _player.Pause();
}

export function PlayPause() {
	return _player.PlayPause();
}

export function Stop() {
	return _player.Stop();
}

export function Next() {
	return _player.Next();
}

export function Previous() {
	return _player.Previous();
}

export function Shuffle() {
	return _player.Shuffle();
}

export function Repeat() {
	return _player.Repeat();
}

export function Seek(offset: number) {
	return _player.Seek(offset);
}

export function SeekPercentage(percentage: number) {
	return _player.SeekPercentage(percentage);
}

export function GetPosition() {
	return _player.GetPosition();
}
