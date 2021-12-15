import { getAppData } from "../util";
import { resolve } from "path";
import leveldown from "leveldown";
import levelup from "levelup";
import { stat } from "fs/promises";

export async function searchForUserToken(): Promise<string | undefined>{
	const mxmLocalStorage = resolve(getAppData(), "Musixmatch", "Local Storage", "leveldb");
	try{
		await stat(mxmLocalStorage);
	}catch(_){
		return undefined;
	}

	const db = levelup(leveldown(mxmLocalStorage));

	const mxmCookie = await db.get("_file://\u0000\u0001cookie");
	return /musixmatchUserToken=(.+?);/.exec(mxmCookie)?.[1];
}
