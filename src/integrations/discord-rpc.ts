import RPC from "discord-rpc";
import { Update } from "../types";
import { debug } from "../util";

const disabled = typeof process.env.DISCORDRPC !== "undefined" && !process.env.DISCORDRPC;
debug("Discord RPC is disabled?", disabled);

const clientId = "908012408008736779";

let rpc: RPC.Client | undefined;

let loginPromise;

async function login(){
	if(loginPromise) return loginPromise;

	let _resolve;
	loginPromise = new Promise(resolve => {_resolve = resolve;});

	const client = new RPC.Client({
		transport: "ipc"
	});

	client.once("connected", () => {
		debug("Discord RPC is connected");
	});

	// @ts-ignore
	client.once("disconnected", async () => {
		debug("Discord RPC was disconnected");
		rpc = undefined;
	});

	let error;
	do{
		try{
			debug("Discord RPC logging in");
			error = false;
			await client.login({ clientId });
		}catch(_e){
			error = true;
			debug("Discord RPC errored out while logging in, waiting 5 seconds before retrying");
			await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}while(error);

	rpc = client;
	_resolve();
	loginPromise = undefined;
}

export async function updatePresence(update?: Update) {
	if (disabled) return;

	while (!rpc)
		await login();

	if(!update || !update.metadata.id) {
		rpc.clearActivity();
		return;
	}

	const now = Date.now();
	const start = Math.round(now - (update.elapsed * 1000));
	const end = Math.round(start + (update.metadata.length * 1000));

	const activity: RPC.Presence = {
		details: update.metadata.artist,
		state: update.metadata.title,
		largeImageKey: "app_large",
		largeImageText: update.metadata.album,
		smallImageKey: update.status.toLowerCase(),
		smallImageText: update.status,
		instance: false
	};

	if (update.status === "Playing") {
		activity.startTimestamp = start;
		activity.endTimestamp = end;
	}

	return rpc.setActivity(activity);
}
