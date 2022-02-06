import songdata from "./songdata.js";

const seekbarWhole = document.getElementById("seekbar")!;
const seekbarFg = document.getElementById("seekbar-fg")!;
const seekbarBall = document.getElementById("seekbar-ball")!;

seekbarWhole.onclick = seekTo;

seekbarWhole.onmousedown = (e) => {
	e.preventDefault();

	if(seekbarWhole.classList.contains("draggable")){
		seekbarWhole.onmousemove = (e) => {
			e.preventDefault();
			const rect = seekbarWhole.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.round(x / rect.width * 100);
			seekbarFg.classList.add("dragging");
			seekbarFg.style.width = percentage + "%";
			seekbarBall.style.left = percentage + "%";
		};

		seekbarWhole.onmouseup = (e) => {
			seekbarWhole.onmouseup = null;
			seekbarWhole.onmousemove = null;
			seekbarWhole.onmouseleave = null;
			seekbarWhole.classList.remove("dragging");
			seekTo(e);
		};

		seekbarWhole.onmouseleave = () => {
			seekbarWhole.onmouseup = null;
			seekbarWhole.onmousemove = null;
			seekbarWhole.onmouseleave = null;
			seekbarFg.classList.remove("dragging");
		};
	}
};

function seekTo(e) {
	const rect = seekbarWhole.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const percentage = x / rect.width;
	window.np.seek(percentage);
}

export function updateSeekbarStatus() {
	if(songdata.capabilities.canSeek)
		seekbarWhole.classList.add("draggable");
	else
		seekbarWhole.classList.remove("draggable");
}

export function updateSeekbarTime() {
	if (!songdata.metadata.id)
		return;

	if(songdata.reportsPosition)
		document.documentElement.classList.remove("not-reporting-position");
	else
		document.documentElement.classList.add("not-reporting-position");

	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	if (!seekbarFg.classList.contains("dragging")){
		seekbarFg!.style.width = `${seekbarPercent}%`;
		seekbarBall!.style.left = `${seekbarPercent}%`;
	}
}
