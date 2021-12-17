import type { Lyrics } from "../../types";

import { URLSearchParams } from "url";
import axios, { AxiosResponse } from "axios";
import { songdata } from "../playbackStatus";

const search_url = "https://genius.com/api/search/song";

export async function query(): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "Genius",
		synchronized: false,
		copyright: undefined,
		lines: []
	};


	const songId = await getSongURL();
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

function getSearchFields() {
	const post_fields = new URLSearchParams({
		q: songdata.metadata.artist + " " + songdata.metadata.title,
		per_page: "1"
	});

	return post_fields.toString();
}

async function getSongURL() {
	let result: AxiosResponse<any, any>;
	try {
		result = await axios.get(search_url + "?" + getSearchFields());
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
	
	let lyricsSections = result.data?.match(/<div class="lyrics">(.+?)<\/div>/s);
	if(lyricsSections?.[1]){
		const template = document.createElement("div");
		template.innerHTML = lyricsSections?.[1];
		return template.textContent!.trim();
	}

	lyricsSections = result.data?.match(/<div class="Lyrics__Container.+?>.+?<\/div>/sg);
	if (lyricsSections) {
		let lyricsInner = "";
		for (const section of lyricsSections) {
			const fragment = section.match(/<div class="Lyrics__Container.+?>(.+?)<\/div>/s);
			if (fragment) lyricsInner += fragment[1];
		}
		const template = document.createElement("div");
		template.innerHTML = lyricsInner;
		return getLyrics(template);
	}

	lyricsSections = result.data?.match(/<div data-scrolltrigger-pin="true" class="Lyrics__Container.+?>.+?<\/div>/sg);
	if (lyricsSections) {
		let lyricsInner = "";
		for (const section of lyricsSections) {
			const fragment = section.match(/<div data-scrolltrigger-pin="true" class="Lyrics__Container.+?>(.+?)<\/div>/s);
			if (fragment) lyricsInner += fragment[1];
		}
		const template = document.createElement("div");
		template.innerHTML = lyricsInner;
		return getLyrics(template);
	}

	return undefined;
}

function getLyrics(template){
	function flattener(nodelist){
		return nodelist.map(x => x.childNodes.length ? flattener([...x.childNodes]) : x).flat();
	}
	return flattener([...template.childNodes]).flat().map(x => x.tagName === "BR" ? "\n" : x.textContent).join("").trim();
}
