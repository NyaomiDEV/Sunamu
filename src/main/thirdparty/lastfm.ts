// The following is actually Sunamu's own API key for Last.FM
// Please do not copy it, or if you do, please do not use it
// for spammy queries. We do not really want it to get rate

import { songdata } from "../playbackStatus";
import fetch, { Request } from "node-fetch";

// limited, do we?
const apiKey = "fd35d621eee8c53c1130c12b2d53d7fb";
const root = "https://ws.audioscrobbler.com/2.0/";

function queryString(options){
	const params = {
		...options,
		format: "json",
		api_key: apiKey
	};

	return Object.keys(params).map(key => key + "=" + encodeURIComponent(params[key])).join("&");
}

export async function queryLastFM(methodName, options){
	const allOptions = {
		method: methodName,
		...options
	};

	const request = new Request(
		root + "?" + queryString(allOptions)
	);

	const result = await fetch(request);
	return await result.json() as any;
}

export async function getTrackInfo(forUsername){
	const opts: any = {
		track: songdata.metadata.title,
		artist: songdata.metadata.artist,
		autocorrect: 1
	};

	if(forUsername) opts.username = forUsername;

	const result = await queryLastFM("track.getInfo", opts);
	if(result.track) songdata.lastfm = result.track;
}
