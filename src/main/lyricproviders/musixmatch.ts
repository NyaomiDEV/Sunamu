import type { Lyrics, Metadata } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { get as getConfig, set as setConfig } from "../config";
import { searchForUserToken } from "../integrations/mxmusertoken";

async function queryMusixmatch(method: string, params: URLSearchParams): Promise<any | undefined> {
	const url = "https://apic-desktop.musixmatch.com/ws/1.1/";

	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(url + method + "?" + params.toString(), {
			headers: {
				"Cookie": "x-mxm-user-id=",
				"Authority": "apic-desktop.musixmatch.com",
			}
		});
	} catch (e) {
		console.error(`Musixmatch token request for method ${method} errored out!`, e);
		return undefined;
	}

	return result.data;
}

async function getToken(){
	const tokenQueryParams = new URLSearchParams({
		app_id: "web-desktop-app-v1.0",
		t: Math.random().toString(36).replace(/[^a-z]+/g, "").slice(2, 10)
	});

	const result = await queryMusixmatch("token.get", tokenQueryParams);
	if(result) {
		const token = result.message.body.user_token;
		if (token.length && token !== "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly")
			return token;
	}

	console.error("Musixmatch token request did not get us any token!");
	return undefined;
}

export async function query(metadata: Metadata, spotifyId?: string): Promise<Lyrics | undefined> {
	if (!getConfig("mxmusertoken")){
		const token = await searchForUserToken() || await getToken();
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

	const queryParams = new URLSearchParams({
		app_id: "web-desktop-app-v1.0",
		format: "json",
		namespace: "lyrics_richsynched",
		optional_calls: "track.richsync",
		subtitle_format: "mxm",
		q_artist: metadata.artist,
		q_artists: metadata.artist,
		q_track: metadata.title,
		q_album: metadata.album,
		q_duration: `${metadata.length}`,
		f_subtitle_length: `${metadata.length}`,
		f_subtitle_length_max_deviation: "40",
		usertoken: getConfig("mxmusertoken")
	});

	if (spotifyId)
		queryParams.append("track_spotify_id", spotifyId);

	const result = await queryMusixmatch("macro.subtitles.get", queryParams);

	const karaokeLyrics = result.message?.body?.macro_calls?.["track.richsync.get"]?.message;
	const karaoke = karaokeLyrics?.body?.richsync;

	const synchronizedLyrics = result.message?.body?.macro_calls?.["track.subtitles.get"]?.message;
	const subtitle = synchronizedLyrics?.body?.subtitle_list?.[0]?.subtitle;

	const unsynchronizedLyrics = result.message?.body?.macro_calls?.["track.lyrics.get"]?.message;
	const lyrics = unsynchronizedLyrics?.body?.lyrics;

	if (karaoke?.richsync_body) {
		reply.lines = JSON.parse(karaoke.richsync_body).map(v => ({
			text: v.x,
			time: v.ts,
			karaoke: v.l.map(x => ({
				text: x.c,
				start: v.ts + x.o
			}))
		}));
		reply.copyright = karaoke.lyrics_copyright?.trim().split("\n").join(" • ");
	} else if (subtitle?.subtitle_body) {
		reply.lines = JSON.parse(subtitle.subtitle_body).map(v => ({ text: v.text, time: v.time.total }));
		reply.copyright = subtitle.lyrics_copyright?.trim().split("\n").join(" • ");
	}
	else if (lyrics?.lyrics_body) {
		reply.synchronized = false;
		reply.lines = lyrics.lyrics_body.split("\n").map(x => ({ text: x }));
		reply.copyright = lyrics.lyrics_copyright?.trim().split("\n").join(" • ");
	} else {
		console.error(
			"Musixmatch request didn't get us any lyrics!",
			result.message?.header,
			karaokeLyrics?.header || null,
			karaoke || null,
			synchronizedLyrics?.header || null,
			subtitle || null,
			unsynchronizedLyrics?.header || null,
			lyrics || null
		);
		return undefined;
	}

	return reply;
}