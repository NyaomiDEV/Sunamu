import lang from "./lang.js";
import songdata from "./songdata.js";
import owoify from "./owoify.js";

const container = document.getElementsByClassName("lyrics")[0];
const footer = document.getElementsByClassName("lyrics-footer")[0];
const glasscordUser = await window.np.shouldBullyGlasscordUser();

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
		if (i === lineIndex){
			const line = container.children[i] as HTMLElement;
			line.style.opacity = "";
			line.style.filter = "";
			line.classList?.add("active");
		}else{
			const line = container.children[i] as HTMLElement;
			const distance = Math.abs(i - lineIndex);
			switch(distance){
				case 1:
					line.style.opacity = "0.875";
					line.style.filter = "blur(1px)";
					break;
				case 2:
					line.style.opacity = "0.75";
					line.style.filter = "blur(2px)";
					break;
				case 3:
					line.style.opacity = "0.625";
					line.style.filter = "blur(4px)";
					break;
				default:
					line.style.opacity = "0.5";
					line.style.filter = "blur(8px)";
					break;
			}
			line.classList?.remove("active");
		}
	}

	// now we bring the active into view
	if (!wasActiveBefore) {
		container.children[lineIndex]?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}
}

window.np.registerLyricsCallback!(() => putLyricsInPlace());