import type { Lyrics, Metadata } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { get as getConfig, set as setConfig } from "../config";
import { searchForUserToken } from "../integrations/mxmusertoken";

const url = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get";

function getQueryParams(metadata: Metadata, spotifyId?: string) {
	const params = new URLSearchParams({
		app_id: "web-desktop-app-v1.0",
		format: "json",
		namespace: "lyrics_richsynched",
		subtitle_format: "mxm",
		q_artist: metadata.artist,
		q_artists: metadata.artist,
		q_track: metadata.title,
		q_album: metadata.album,
		q_duration: `${metadata.length}`,
		usertoken: getConfig("mxmusertoken")
	});

	if (spotifyId)
		params.append("track_spotify_id", spotifyId);

	return params.toString();
}

export async function query(metadata: Metadata, spotifyId?: string): Promise<Lyrics | undefined> {
	if (!getConfig("mxmusertoken")){
		const token = await searchForUserToken();
		if(!token){
			console.error("No Musixmatch user token found");
			return undefined;
		}

		setConfig("mxmusertoken", token);
	}

	const reply: Lyrics = {
		provider: "Musixmatch",
		synchronized: true,
		copyright: undefined,
		lines: []
	};

	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(url + "?" + getQueryParams(metadata, spotifyId), {
			headers: {
				"Cookie": "x-mxm-user-id=",
				"Authority": "apic-desktop.musixmatch.com"
			}
		});
	} catch (e) {
		console.error("Musixmatch request got an error!", e);
		return undefined;
	}

	const synchronizedLyrics = result.data.message?.body?.macro_calls?.["track.subtitles.get"]?.message;
	const subtitle = synchronizedLyrics?.body?.subtitle_list?.[0]?.subtitle;

	const unsynchronizedLyrics = result.data.message?.body?.macro_calls?.["track.lyrics.get"]?.message;
	const lyrics = unsynchronizedLyrics?.body?.lyrics;

	if (subtitle?.subtitle_body) {
		reply.lines = JSON.parse(subtitle?.subtitle_body).map(v => ({ text: v.text, time: v.time.total }));
		reply.copyright = subtitle?.lyrics_copyright?.trim().split("\n").join(" • ");
	}
	else if (lyrics?.lyrics_body) {
		reply.synchronized = false;
		reply.lines = lyrics?.lyrics_body.split("\n").map(x => ({ text: x }));
		reply.copyright = lyrics?.lyrics_copyright?.trim().split("\n").join(" • ");
	} else {
		console.error(
			"Musixmatch request didn't get us any lyrics!",
			result.data.message?.header,
			synchronizedLyrics?.header || null,
			subtitle || null,
			unsynchronizedLyrics?.header || null,
			lyrics || null
		);
		return undefined;
	}

	return reply;
}