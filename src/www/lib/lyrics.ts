import lang from "./lang.js";
import songdata from "./songdata.js";
import owoify from "./owoify.js";
import { isHidden } from "./showhide.js";

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
	if (!songdata.lyrics?.synchronized)
		return;

	if (!songdata.reportsPosition){
		container.classList.remove("synchronized");
		return;
	}
	
	container.classList.add("synchronized");

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

export function toggleLyricsView(show?: boolean) {
	if (document.documentElement.classList.contains("no-lyrics"))
		return;

	if (typeof show === "undefined")
		show = document.getElementsByClassName("lyrics")[0].classList.contains("hidden");

	if (show) {
		document.getElementsByClassName("metadata")[0].classList.add("hidden");
		document.getElementsByClassName("lyrics")[0].classList.remove("hidden");
		document.getElementsByClassName("lyrics-footer")[0].classList.remove("hidden");

		reCenter();
		window.onresize = () => reCenter();
	} else {
		document.getElementsByClassName("metadata")[0].classList.remove("hidden");
		document.getElementsByClassName("lyrics")[0].classList.add("hidden");
		document.getElementsByClassName("lyrics-footer")[0].classList.add("hidden");

		window.onresize = null;
	}
}

function reCenter() {
	if (document.getElementsByClassName("lyrics")[0].children.length === 1) {
		// assuming we only have one child so it is the no lyrics child
		document.getElementsByClassName("lyrics")[0].children[0].scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	} else {
		// we do have lyrics so we scroll to the active one
		document.getElementsByClassName("line active")[0]?.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	}
}

window.np.registerLyricsCallback!(() => {
	putLyricsInPlace();
	if (isHidden && songdata.lyrics?.synchronized)
		toggleLyricsView(true);
});