import type { Lyrics, Metadata } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { parseLrc } from "./lrc";

const search_url = "http://music.163.com/api/search/get";
const lyrics_url = "http://music.163.com/api/song/lyric";

export async function query(metadata: Metadata): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "NetEase Music",
		synchronized: true,
		copyright: undefined,
		lines: []
	};


	const songId = await getSongId(metadata);
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
	
	console.error("Could not get synchronized lyrics on NetEase!");
	return undefined;
}

function getSearchFields(metadata: Metadata){
	const post_fields = new URLSearchParams({
		s: metadata.artist + " " + metadata.title,
		type: "1",
		limit: "10",
		offset: "0"
	});

	return post_fields.toString();
}

function getLyricFields(songId){
	const lyric_fields = new URLSearchParams({
		id: songId,
		lv: "-1"
	});

	return lyric_fields.toString();
}

async function getSongId(metadata: Metadata){
	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(search_url + "?" + getSearchFields(metadata));
	} catch (e) {
		console.error("NetEase search request got an error!", e);
		return undefined;
	}

	return result?.data.result?.songs?.[0].id;
}

async function getLyricsFromSongId(songId){
	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(lyrics_url + "?" + getLyricFields(songId));
	} catch (e) {
		console.error("NetEase lyrics request got an error!", e);
		return undefined;
	}

	return result.data.lrc?.lyric;
}
