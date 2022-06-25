/* eslint-disable no-unused-vars */
import { Position, Update } from "../../types";

const fallback: Player = {
	init: async (_callback: Function) => undefined,
	getUpdate: async () => null,
	Play: async () => undefined,
	Pause: async () => undefined,
	PlayPause: async () => undefined,
	Stop: async () => undefined,
	Next: async () => undefined,
	Previous: async () => undefined,
	Shuffle: () => undefined,
	Repeat: () => undefined,
	Seek: async (_offset: number) => undefined,
	SeekPercentage: async (_percentage: number) => undefined,
	SetPosition: async (_position: number) => undefined,
	GetPosition: async () => ({howMuch: 0, when: new Date(0)}),
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

	Play(): Promise<void>
	Pause(): Promise<void>
	PlayPause(): Promise<void>
	Stop(): Promise<void>

	Next(): Promise<void>
	Previous(): Promise<void>

	Shuffle(): void
	Repeat(): void

	Seek(offset: number): Promise<void>
	SeekPercentage(percentage: number): Promise<void>
	GetPosition(): Promise<Position>
	SetPosition(position: number): Promise<void>
}