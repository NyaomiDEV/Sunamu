import type { LrcFile, LyricsKaraokeVerse, LyricsLine } from "../../types";

const howATimestampLooks = /\[(\d+:\d+\.?\d+)\]|\[(\d+?),(\d+)\]/g;
const howALyricsLineLooks = /((?:\[\d+:\d+\.?\d+\]|\[\d+,\d+\])+)(.*)/;

function convertTime(timeString: string): number {
	const [minutes, seconds] = timeString.split(":");
	return parseInt(minutes) * 60 + parseFloat(seconds);
}

function extractTime(timestamps: string){
	const matches = [...timestamps.matchAll(howATimestampLooks)];
	const time: number[] = [];
	matches.forEach(m => {
		if(m[1])
			time.push(convertTime(m[1]));
		else if(m[2])
			time.push(Number(m[2]) / 1000);
	});
	return time;
}

function extractMetadataLine(data: string): string[] {
	return data.trim().slice(1, -1).split(": ");
}

function extractKaraokeNetEase(line: string, timestamp: number): LyricsKaraokeVerse[] {
	// netease karaoke line
	const howANetEaseKaraokeLineLooks = /\(\d+,(\d+)\)/g;
	const components = line.split(howANetEaseKaraokeLineLooks);
	const karaokeVerses: LyricsKaraokeVerse[] = [];
	let accumulator = 0;
	for(let i = 1; i < components.length; i += 2){
		karaokeVerses.push({
			text: components[i + 1],
			start: timestamp + accumulator
		});
		accumulator += Number(components[i]) / 1000;
	}

	return karaokeVerses;
}

export function parseLrc(data: string): LrcFile{
	const result: LrcFile = {
		metadata: {},
		lines: []
	};

	// Sanitize our data first and foremost
	// remove enhanced LRC format
	// TODO: Do not remove this and instead use it
	data = data.replace(/<\d+:\d+\.\d+>/g, "").replace(/<\d+:\d+>/g, "").replace(/<\d+>/g, "");
	// extend compressed time tags (ex. [01:30] becomes [01:30.000])
	data = data.replace(/\[(\d+):(\d+)\]/g, (_match: any, p1: any, p2: any) => `[${p1}:${p2}.000]`);

	let lines = data.trim().split("\n").map((x: string) => x.trim());

	for(const line of lines){
		const lyrdata = howALyricsLineLooks.exec(line);
		if(lyrdata){
			for(const timestamp of extractTime(lyrdata[1])){
				const resultLine: LyricsLine = {
					text: lyrdata[2].replace(/\(\d+,\d+\)/g, "").replace(/\s+/g, " "),
					time: timestamp,
					karaoke: extractKaraokeNetEase(lyrdata[2], timestamp)
				};

				if(!resultLine.karaoke?.length)
					delete resultLine.karaoke;
				
				result.lines.push(resultLine);
			}
		}else{
			const [ key, value ] = extractMetadataLine(line);
			result.metadata[key] = value;
		}
	}

	result.lines.sort((a, b) => a.time! - b.time!);
	return result;
}
