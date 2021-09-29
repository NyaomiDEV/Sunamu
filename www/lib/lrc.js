const howALyricsLineLooks = /\[(\d*:\d*\.?\d*)\](.*)/;

function convertTime(timeString) {
	const [minutes, seconds] = timeString.split(":");
	return parseInt(minutes) * 60 + parseFloat(seconds);
}

function extractMetadataLine(data) {
	return data.trim().slice(1, -1).split(": ");
}

/** @return {LrcFile} */
export function parseLrc(data){
	const result = {
		metadata: {},
		lines: []
	};

	// Sanitize our data first and foremost
	// remove enhanced LRC format
	data = data.replace(/<\d+:\d+\.\d+>/g, "").replace(/<\d+:\d+>/g, "").replace(/<\d+>/g, "");
	// extend compressed time tags (ex. [01:30] becomes [01:30.000])
	data = data.replace(/\[(\d+):(\d+)\]/g, (_match, p1, p2) => `[${p1}:${p2}.000]`);

	let lines = data.trim().split("\n").map(x => x.trim());

	for(const line of lines){
		const lyrdata = howALyricsLineLooks.exec(line);
		if(lyrdata){
			result.lines.push({
				text: lyrdata[2].replace(/\s+/g, " "),
				time: convertTime(lyrdata[1])
			});
		}else{
			const [ key, value ] = extractMetadataLine(line);
			result.metadata[key] = value;
		}
	}
	return result;
}
