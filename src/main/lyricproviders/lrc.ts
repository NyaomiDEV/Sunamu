import type { LrcFile } from "../../types";

const howATimestampLooks = /(?:\[(\d+:\d+\.?\d+)\])/g;
const howALyricsLineLooks = /((?:\[\d+:\d+\.?\d+\])+)(.*)/;

function convertTime(timeString: string): number {
	const [minutes, seconds] = timeString.split(":");
	return parseInt(minutes) * 60 + parseFloat(seconds);
}

function extractTime(timestamps: string){
	const matches = [...timestamps.matchAll(howATimestampLooks)];
	const time: number[] = [];
	matches.forEach(m => time.push(convertTime(m[1])));
	return time;
}

function extractMetadataLine(data: string): string[] {
	return data.trim().slice(1, -1).split(": ");
}

export function parseLrc(data: string): LrcFile{
	const result: LrcFile = {
		metadata: {},
		lines: []
	};

	// Sanitize our data first and foremost
	// remove enhanced LRC format
	data = data.replace(/<\d+:\d+\.\d+>/g, "").replace(/<\d+:\d+>/g, "").replace(/<\d+>/g, "");
	// extend compressed time tags (ex. [01:30] becomes [01:30.000])
	data = data.replace(/\[(\d+):(\d+)\]/g, (_match: any, p1: any, p2: any) => `[${p1}:${p2}.000]`);

	let lines = data.trim().split("\n").map((x: string) => x.trim());

	for(const line of lines){
		const lyrdata = howALyricsLineLooks.exec(line);
		if(lyrdata){
			for(const timestamp of extractTime(lyrdata[1])){
				result.lines.push({
					text: lyrdata[2].replace(/\s+/g, " "),
					time: timestamp
				});
			}
		}else{
			const [ key, value ] = extractMetadataLine(line);
			result.metadata[key] = value;
		}
	}

	result.lines.sort((a, b) => a.time! - b.time!);
	return result;
}
