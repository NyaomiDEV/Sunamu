import type { Lyrics } from "../../../types";

import songdata from "../songdata.js";

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
	const post_fields = {
		q: songdata.metadata.artist + " " + songdata.metadata.title,
		per_page: 1
	};

	return Object.keys(post_fields).map(key => key + "=" + encodeURIComponent(post_fields[key])).join("&");
}

async function getSongURL() {
	const search_request = new Request(
		search_url + "?" + getSearchFields()
	);

	let result;
	try {
		result = await (await fetch(search_request, {mode: "no-cors"})).json();
	} catch (e) {
		console.error("Genius search request got an error!", e);
		result = {};
	}

	return result?.response?.sections?.[0]?.hits?.[0]?.result?.url || undefined;
}

async function getLyricsFromGenius(url) {
	const request = new Request(url);

	let result;
	try {
		result = await (await fetch(request, {mode: "no-cors"})).text();
	} catch (e) {
		console.error("Genius lyrics request got an error!", e);
		return undefined;
	}
	
	let lyricsSections = result?.match(/<div class="lyrics">(.+?)<\/div>/s)?.[1];
	if(lyricsSections){
		const template = document.createElement("div");
		template.innerHTML = lyricsSections;
		return template.textContent!.trim();
	}

	lyricsSections = result.match(/<div class="Lyrics__Container.+?>.+?<\/div>/sg);
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

	lyricsSections = result.match(/<div data-scrolltrigger-pin="true" class="Lyrics__Container.+?>.+?<\/div>/sg);
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
