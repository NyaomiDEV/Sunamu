import type { Lyrics, Metadata } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { JSDOM } from "jsdom";

const search_url = "https://genius.com/api/search/song";

export async function query(metadata: Metadata): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "Genius",
		synchronized: false,
		copyright: undefined,
		lines: []
	};


	const songId = await getSongURL(metadata);
	if (!songId) {
		console.error("Could not find the song on Genius!");
		return undefined;
	}

	const lyrics = await getLyricsFromGenius(songId);
	if (!lyrics) {
		console.error("Could not get lyrics on Genius!");
		return undefined;
	}

	reply.lines = lyrics.split("\n").map(x => ({text: x}));
	return reply;
}

function getSearchFields(metadata: Metadata) {
	const post_fields = new URLSearchParams({
		q: metadata.artist + " " + metadata.title,
		per_page: "1"
	});

	return post_fields.toString();
}

async function getSongURL(metadata: Metadata) {
	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(search_url + "?" + getSearchFields(metadata));
	} catch (e) {
		console.error("Genius search request got an error!", e);
		return undefined;
	}

	return result.data.response?.sections?.[0]?.hits?.[0]?.result?.url;
}

async function getLyricsFromGenius(url) {
	let result: AxiosResponse<string, any>;
	try {
		result = await axios.get<string>(url, {responseType: "text"});
	} catch (e) {
		console.error("Genius lyrics request got an error!", e);
		return undefined;
	}

	const dom = new JSDOM(result.data.split("<br/>").join("\n"));

	const lyricsDiv = dom.window.document.querySelector("div.lyrics");
	if(lyricsDiv)
		return lyricsDiv.textContent?.trim();

	const lyricsSections = [...dom.window.document.querySelectorAll("div[class^=Lyrics__Container]").values()].map(x => x.textContent);
	return lyricsSections.join("\n");
}
