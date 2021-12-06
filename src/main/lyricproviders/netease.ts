import type { Lyrics } from "../../types";

import fetch, { Request } from "node-fetch";
import { parseLrc } from "./lrc";
import { songdata } from "../playbackStatus";

const search_url = "http://music.163.com/api/search/get";
const lyrics_url = "http://music.163.com/api/song/lyric";

export async function query(): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "NetEase Music",
		synchronized: true,
		copyright: undefined,
		lines: []
	};


	const songId = await getSongId();
	if(!songId){
		console.error("Could not find the song on NetEase!");
		return undefined;
	}

	const lyrics = await getLyricsFromSongId(songId);
	if (!lyrics) {
		console.error("Could not get lyrics on NetEase!");
		return undefined;
	}

	reply.lines = parseLrc(lyrics).lines;

	if(reply.lines.length)
		return reply;
	
	return undefined;
}

function getSearchFields(){
	const post_fields = {
		s: songdata.metadata.artist + " " + songdata.metadata.title,
		type: 1,
		limit: 10,
		offset: 0
	};

	return Object.keys(post_fields).map(key => key + "=" + encodeURIComponent(post_fields[key])).join("&");
}

function getLyricFields(songId){
	const lyric_fields = {
		id: songId,
		lv: -1
	};

	return Object.keys(lyric_fields).map(key => key + "=" + encodeURIComponent(lyric_fields[key])).join("&");
}

async function getSongId(){
	const search_request = new Request(
		search_url + "?" + getSearchFields()
	);

	let result;
	try {
		result = await (await fetch(search_request)).json();
	} catch (e) {
		console.error("NetEase search request got an error!", e);
		result = {};
	}

	return result?.result?.songs?.[0].id || undefined;
}

async function getLyricsFromSongId(songId){
	const search_request = new Request(
		lyrics_url + "?" + getLyricFields(songId)
	);

	let result;
	try {
		result = await (await fetch(search_request)).json();
	} catch (e) {
		console.error("NetEase lyrics request got an error!", e);
		result = {};
	}

	return result?.lrc?.lyric || undefined;
}
