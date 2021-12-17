/* eslint-disable no-unused-vars */
import { Update } from "../../types";

const fallback: Player = {
	init: async (_callback: Function) => undefined,
	getUpdate: async () => null,
	Play: () => undefined,
	Pause: () => undefined,
	PlayPause: () => undefined,
	Stop: () => undefined,
	Next: () => undefined,
	Previous: () => undefined,
	Shuffle: () => undefined,
	Repeat: () => undefined,
	Seek: (_offset: number) => undefined,
	SeekPercentage: (_percentage: number) => undefined,
	GetPosition: async () => 0,
};

let player: Player;

export default async function getPlayer(){
	if(!player){
		switch (process.platform) {
			case "linux":
				let MPRIS2 = await import("./mpris2");
				player = Object.assign({}, MPRIS2);
				break;
			case "win32":
				let winplayer = await import("./winplayer");
				player = Object.assign({}, winplayer);
				break;
			default:
				console.error("Player: Unsupported platform!");
				player = Object.assign({}, fallback);
				break;
		}
	}

	return player;
}

export interface Player {
	init(callback: Function): Promise<void>
	getUpdate(): Promise<Update | null>

	Play(): void
	Pause(): void
	PlayPause(): void
	Stop(): void

	Next(): void
	Previous(): void

	Shuffle(): void
	Repeat(): void

	Seek(offset: number): void
	SeekPercentage(percentage: number): void
	GetPosition(): Promise<number>
}