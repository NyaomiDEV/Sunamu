import type { Lyrics, Metadata } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { get as getConfig, set as setConfig } from "../config";
import { searchForUserToken } from "../integrations/mxmusertoken";
import { getOSLocale } from "../util";

async function queryMusixmatch(method: string, params?: any, shouldUseToken = true): Promise<any | undefined> {

	// Get a token from the usual places
	const token = getConfig("mxmusertoken") || await searchForUserToken() || await getToken() || undefined;
	
	// If we still haven't got one, then exit if we're not actually requesting that the call has no token attached
	if (!token && shouldUseToken) {
		console.error("No Musixmatch user token found");
		return undefined;
	}

	// If we don't have one in the config and we now have one, then set whatever we have in it 
	if(!getConfig("mxmusertoken") && token)
		setConfig("mxmusertoken", token);

	const url = "https://apic-desktop.musixmatch.com/ws/1.1/";

	const _params = new URLSearchParams({
		app_id: "web-desktop-app-v1.0",
		t: Math.random().toString(36).replace(/[^a-z]+/g, "").slice(2, 10),
		usertoken: token,
		...params
	});

	// If we don't have to use a token, we delete the parameter since it'll be "undefined"
	if(!shouldUseToken)
		_params.delete("usertoken");

	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(url + method + "?" + _params.toString(), {
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
	const result = await queryMusixmatch("token.get", {}, false);
	if(result) {
		const token = result.message.body.user_token;
		if (token.length && token !== "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly")
			return token;
	}

	console.error("Musixmatch token request did not get us any token!");
	return undefined;
}

export async function query(metadata: Metadata, spotifyId?: string): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "Musixmatch",
		synchronized: true,
		copyright: undefined,
		lines: []
	};

	const queryParams: any = {
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
	};

	if (spotifyId)
		queryParams.track_spotify_id = spotifyId;

	const result = await queryMusixmatch("macro.subtitles.get", queryParams);

	const trackId = result.message?.body?.macro_calls?.["matcher.track.get"]?.message?.body?.track?.track_id;

	const richsyncMessage = result.message?.body?.macro_calls?.["track.richsync.get"]?.message;
	const richsync = richsyncMessage?.body?.richsync;

	const subtitlesMessage = result.message?.body?.macro_calls?.["track.subtitles.get"]?.message;
	const subtitle = subtitlesMessage?.body?.subtitle_list?.[0]?.subtitle;

	const lyricsMessage = result.message?.body?.macro_calls?.["track.lyrics.get"]?.message;
	const lyrics = lyricsMessage?.body?.lyrics;

	if (richsync?.richsync_body) {
		reply.lines = JSON.parse(richsync.richsync_body).map(v => ({
			text: v.x,
			time: v.ts,
			karaoke: v.l.map(x => ({
				text: x.c,
				start: v.ts + x.o
			}))
		}));
		reply.copyright = richsync.lyrics_copyright?.trim().split("\n").join(" • ");
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
			richsyncMessage?.header || null,
			richsync || null,
			subtitlesMessage?.header || null,
			subtitle || null,
			lyricsMessage?.header || null,
			lyrics || null
		);
		return undefined;
	}

	if(trackId){
		const translations = await queryTranslation(trackId);
		if(translations){
			for (const line in reply.lines) {
				for (const translationLine of translations) {
					if (
						reply.lines[line].text.toLowerCase().trim() === translationLine.translation.matched_line.toLowerCase().trim() ||
						reply.lines[line].text.toLowerCase().trim() === translationLine.translation.subtitle_matched_line.toLowerCase().trim()
					)
						reply.lines[line].translation = translationLine.translation.description.trim();
				}
			}
		}
	}

	return reply;
}

async function queryTranslation(trackId: string){
	const queryParams = {
		format: "json",
		comment_format: "text",
		part: "user",
		track_id: trackId,
		translation_fields_set: "minimal",
		selected_language: getConfig("mxmlanguage") || getConfig("language") || getOSLocale()[0] || "en",
	};

	const result = await queryMusixmatch("crowd.track.translations.get", queryParams);
	return result.message?.body?.translations_list;
}