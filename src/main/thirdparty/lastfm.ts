// The following is actually Sunamu's own API key for Last.FM
// Please do not copy it, or if you do, please do not use it
// for spammy queries. We do not really want it to get rate

import axios from "axios";
import { URLSearchParams } from "url";
import { LastFMInfo, Metadata } from "../../types";

import { debug } from "..";

// limited, do we?
const apiKey = "fd35d621eee8c53c1130c12b2d53d7fb";
const root = "https://ws.audioscrobbler.com/2.0/";

function queryString(options){
	const params = new URLSearchParams({
		...options,
		format: "json",
		api_key: apiKey
	});

	return params.toString();
}

export async function queryLastFM(methodName, options): Promise<any | undefined>{
	const allOptions = {
		method: methodName,
		...options
	};

	try{
		const result = await axios.get(root + "?" + queryString(allOptions));
		return result.data;
	}catch(e){
		debug(`LastFM query for ${methodName} got an error`, e);
	}

	return undefined;
}

export async function getLFMTrackInfo(metadata: Metadata, forUsername: string): Promise<LastFMInfo | undefined>{
	if(!metadata.id) return;
	
	const opts: any = {
		track: metadata.title,
		artist: metadata.artist,
		autocorrect: 1
	};

	if(forUsername) opts.username = forUsername;

	const result = await queryLastFM("track.getInfo", opts);
	if(result?.track) return result.track;
	return undefined;
}
