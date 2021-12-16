import { songdata } from "../playbackStatus";
import { getAll as config } from "../config";
import { debug } from "../";
import fetch, { Request } from "node-fetch";

const root = "https://api.spotify.com/v1/";
let authorization = {
	access_token: "",
	token_type: "",
	expiration: 0
};

async function checkLogin() {
	if (!config().spotify.clientID || !config().spotify.clientSecret){
		debug("No Spotify app credentials in config file");
		return false;
	}

	if (authorization.expiration > Math.floor(Date.now() / 1000)) return true;

	const request = new Request(
		"https://accounts.spotify.com/api/token",
		{
			headers: {
				"Authorization": `Basic ${btoa(`${config().spotify.clientID}:${config().spotify.clientSecret}`)}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "POST",
			body: "grant_type=client_credentials"
		}
	);

	const result = await fetch(request);

	if(result.status === 200){
		const body = await result.json() as any;
		authorization.access_token = body.access_token;
		authorization.token_type = body.token_type;
		authorization.expiration = (Math.floor(Date.now() / 1000) + body.expires_in);
		return true;
	}

	console.error("Cannot log in to Spotify");
	return false;
}

function encodeObject(obj){
	return Object.keys(obj).map(key => key + "=" + encodeURIComponent(obj[key])).join("&");
}

async function searchPrecise() {
	if (!await checkLogin()) return false;

	const request = new Request(
		root + "search?" + encodeObject({
			q: `artist:"${songdata.metadata.artist?.split("\"").join("\\\"")}" album:"${songdata.metadata.album?.split("\"").join("\\\"")}" ${songdata.metadata.title}`,
			type: "track",
			limit: 1,
			offset: 0
		}),
		{
			headers: {
				"Authorization": `${authorization.token_type} ${authorization.access_token}`
			}
		}
	);

	const result = await fetch(request);

	if (result.status === 200) {
		const body = await result.json() as any;
		return body.tracks.items[0] || undefined;
	}

	console.error("Cannot search song on Spotify");
	return false;
}

async function searchNotSoPrecise() {
	if (!await checkLogin()) return false;

	const request = new Request(
		root + "search?" + encodeObject({
			q: `${songdata.metadata.artist} ${songdata.metadata.album} ${songdata.metadata.title}`,
			type: "track",
			limit: 1,
			offset: 0
		}),
		{
			headers: {
				"Authorization": `${authorization.token_type} ${authorization.access_token}`
			}
		}
	);

	const result = await fetch(request);

	if (result.status === 200) {
		const body = await result.json() as any;
		return body.tracks.items[0] || undefined;
	}

	console.error("Cannot search song on Spotify");
	return false;
}


export async function searchSpotifySong() {
	return await searchPrecise() || await searchNotSoPrecise() || false;
}
