import type { Lyrics } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { songdata } from "../playbackStatus";
import { get as getConfig, set as setConfig } from "../config";
import { searchForUserToken } from "../integrations/mxmusertoken";

const url = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get";

function getQueryParams() {
	const params = new URLSearchParams({
		app_id: "web-desktop-app-v1.0",
		format: "json",
		namespace: "lyrics_richsynched",
		subtitle_format: "mxm",
		q_artist: songdata.metadata.artist,
		q_artists: songdata.metadata.artist,
		q_track: songdata.metadata.title,
		q_album: songdata.metadata.album,
		q_duration: `${songdata.metadata.length}`,
		usertoken: getConfig("mxmusertoken")
	});

	if (songdata.metadata.id)
		params.append("track_spotify_id", songdata.metadata.id);

	return params.toString();
}

export async function query(): Promise<Lyrics | undefined> {
	if (!getConfig("mxmusertoken")){
		const token = await searchForUserToken();
		if(!token) return undefined;

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
		result = await axios.get(url + "?" + getQueryParams(), {
			headers: {
				"Cookie": "x-mxm-user-id=",
				"Authority": "apic-desktop.musixmatch.com"
			}
		});
	} catch (e) {
		console.error("Musixmatch request got an error!", e);
		return undefined;
	}

	const synchronizedLyrics = result.data.message?.body?.macro_calls?.["track.subtitles.get"]?.message?.body?.subtitle_list?.[0]?.subtitle;
	const unsynchronizedLyrics = result.data.message?.body?.macro_calls?.["track.lyrics.get"]?.message?.body?.lyrics;

	if (synchronizedLyrics?.subtitle_body) {
		reply.lines = JSON.parse(synchronizedLyrics.subtitle_body).map(v => ({ text: v.text, time: v.time.total }));
		reply.copyright = synchronizedLyrics.lyrics_copyright?.trim().split("\n").join(" • ");
	}
	else if (unsynchronizedLyrics?.lyrics_body) {
		reply.synchronized = false;
		reply.lines = unsynchronizedLyrics.lyrics_body.split("\n").map(x => ({ text: x }));
		reply.copyright = unsynchronizedLyrics.lyrics_copyright?.trim().split("\n").join(" • ");
	} else {
		console.error(
			"Musixmatch request didn't get us any lyrics!",
			result.data.message?.header,
			result.data.message?.body?.macro_calls?.["track.subtitles.get"]?.message?.header || null,
			result.data.message?.body?.macro_calls?.["track.lyrics.get"]?.message?.header || null
		);
		return undefined;
	}

	return reply;
}