import lang from "./lang.js";
import songdata from "./songdata.js";
import owoify from "./owoify.js";

import { query as Musixmatch } from "./lyricproviders/musixmatch.js";
import { query as NetEase } from "./lyricproviders/netease.js";
import { query as Genius } from "./lyricproviders/genius.js";
import { isElectron } from "./util.js";

const container = document.getElementsByClassName("lyrics")[0];
const footer = document.getElementsByClassName("lyrics-footer")[0];
const glasscordUser = await window.np.shouldBullyGlasscordUser();

export async function queryLyrics() {
	// copy the songdata variable since we run async and might have race conditions between us and the user
	const _songdata = Object.assign({}, songdata);

	/** @type {import("../../types").Lyrics | undefined} */
	let lyrics;
	const id = computeLyricsID(_songdata);

	/** @type {import("../../types").Lyrics | undefined} */
	const cached = await window.np.getLyrics(id);

	if(isElectron() || !(await window.np.isElectronRunning!())){
		// This should only be executed inside the electron (main/renderer) process
		if (!cached || !cached.lines.length || !cached?.synchronized) {
			if (!cached) console.debug(`Cache miss for ${_songdata.metadata.artist} - ${_songdata.metadata.title}`);
			else if (!cached?.synchronized) console.debug(`Cache hit but unsynced lyrics. Trying to fetch synchronized lyrics anyway for ${_songdata.metadata.artist} - ${_songdata.metadata.title}`);

			const providers = {
				Musixmatch,
				NetEase
			};

			// if cached then we could assume it is unsync and genius can only provide unsync
			// @ts-ignore
			if (!cached) providers.Genius = Genius;

			for (const provider in providers) {
				console.debug("Fetching from " + provider);
				lyrics = await providers[provider]();
				if (lyrics && lyrics.lines.length) break;
				lyrics = undefined;
			}

			if (lyrics)
				window.np.saveLyrics(id, lyrics);
		}
	}

	if(cached && !lyrics)
		lyrics = cached;

	// update the lyrics if and only if the current playing song's ID matches
	if (lyrics && lyrics.lines.length && id === computeLyricsID(songdata))
		songdata.lyrics = lyrics;
}

function computeLyricsID(__songdata){
	return `${__songdata.metadata.artist}:${__songdata.metadata.album}:${__songdata.metadata.title}`;
}

export function putLyricsInPlace() {
	// remove all children of container
	container.classList.remove("synchronized");
	// @ts-ignore
	while (container.firstChild) container.removeChild(container.lastChild);

	// remove text from footer
	footer.textContent = "";

	// start checking for no lyrics
	if (!songdata.lyrics) {
		// we exploit the synchronized flex to center the no lyrics line
		container.classList.add("synchronized");

		const noLyrics = document.createElement("span");
		noLyrics.classList.add("line");
		noLyrics.textContent = lang.NO_LYRICS;
		container.appendChild(noLyrics);
		noLyrics.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
		return;
	}

	// we are good with lyrics so we push them all
	if (songdata.lyrics.synchronized && songdata.capabilities.canSeek)
		container.classList.add("synchronized");

	for (const line of songdata.lyrics.lines) {
		const elem = document.createElement("span");
		elem.classList.add("line");
		elem.textContent = glasscordUser ? owoify(line.text) : line.text; // y'all deserve it
		container.appendChild(elem);
	}

	// we put the copyright where it is supposed to be
	footer.textContent = `Provided by ${songdata.lyrics.provider}`;
	if (songdata.lyrics.copyright)
		footer.textContent += ` • ${songdata.lyrics.copyright}`;
}

export function updateActiveLyrics() {
	if (!songdata.lyrics || !songdata.lyrics.synchronized || !songdata.capabilities.canSeek) return;
	// we get the active one
	let lineIndex = songdata.lyrics.lines.length - 1;
	for (let i = 0; i < songdata.lyrics.lines.length; i++) {
		// @ts-ignore
		if (songdata.elapsed < songdata.lyrics.lines[i + 1]?.time) {
			lineIndex = i;
			break;
		}
	}

	// now we iterate through the container to unset previous active stuff
	const wasActiveBefore = container.children[lineIndex]?.classList?.contains("active");

	for (let i = 0; i < container.children.length; i++) {
		if (i === lineIndex)
			container.children[i].classList?.add("active");
		else
			container.children[i].classList?.remove("active");
	}

	// now we bring the active into view
	if (!wasActiveBefore) {
		container.children[lineIndex]?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}
}