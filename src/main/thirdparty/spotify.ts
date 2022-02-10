import { songdata } from "../playbackStatus";
import { getAll as config } from "../config";
import { debug } from "../";
import axios from "axios";
import { URLSearchParams } from "url";

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

	try{
		const result = await axios({
			url: "https://accounts.spotify.com/api/token",
			headers: {
				"Authorization": `Basic ${Buffer.from(`${config().spotify.clientID}:${config().spotify.clientSecret}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "post",
			data: "grant_type=client_credentials"
		});

		if (result.status === 200) {
			authorization.access_token = result.data.access_token;
			authorization.token_type = result.data.token_type;
			authorization.expiration = (Math.floor(Date.now() / 1000) + result.data.expires_in);
			return true;
		}
	}catch(e){
		debug("Spotify login request errored out", e);
	}

	console.error("Cannot log in to Spotify");
	return false;
}

async function searchPrecise() {
	if (!await checkLogin()) return false;

	try{
		const result = await axios({
			url: root + "search?" + (new URLSearchParams({
				q: `artist:"${songdata.metadata.artist?.split("\"").join("\\\"")}" album:"${songdata.metadata.album?.split("\"").join("\\\"")}" ${songdata.metadata.title}`,
				type: "track",
				limit: "1",
				offset: "0"
			})).toString(),
			headers: {
				"Authorization": `${authorization.token_type} ${authorization.access_token}`
			}
		});

		if (result.status === 200)
			return result.data.tracks.items[0] || undefined;
	}catch(e){
		debug("Spotify search precise errored out", e);
	}


	console.error("Cannot search song on Spotify");
	return false;
}

async function searchNotSoPrecise() {
	if (!await checkLogin()) return false;

	try{
		const result = await axios({
			url: root + "search?" + (new URLSearchParams({
				q: `${songdata.metadata.artist} ${songdata.metadata.album} ${songdata.metadata.title}`,
				type: "track",
				limit: "1",
				offset: "0"
			})).toString(),
			headers: {
				"Authorization": `${authorization.token_type} ${authorization.access_token}`
			}
		});

		if (result.status === 200)
			return result.data.tracks.items[0] || undefined;
	}catch(e){
		debug("Spotify search errored out", e);
	}


	console.error("Cannot search song on Spotify");
	return false;
}


export async function searchSpotifySong() {
	if (!songdata.metadata.id) return false;

	return await searchPrecise() || await searchNotSoPrecise() || false;
}
