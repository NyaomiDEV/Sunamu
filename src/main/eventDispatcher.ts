import { Update } from "../types";
import getPlayer from "./player";

// eslint-disable-next-line no-unused-vars
const callbacks: Array<(update?: Update) => void> = [];

export async function updateInfo() {
	const update = await (await getPlayer()).getUpdate();
	if (update) 
		for(const cb of callbacks) cb(update);
	else 
		for(const cb of callbacks) cb();
}

export function addCallback(cb){
	callbacks.push(cb);
}

export function deleteCallback(cb){
	callbacks.splice(callbacks.indexOf(cb), 1);
}