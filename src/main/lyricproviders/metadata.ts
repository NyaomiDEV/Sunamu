import type { Lyrics, Metadata } from "../../types";

export async function query(metadata: Metadata): Promise<Lyrics | undefined> {
	const reply: Lyrics = {
		provider: "Metadata",
		synchronized: false,
		copyright: undefined,
		lines: []
	};

	const lyrics = metadata.lyrics;
	if (!lyrics) {
		console.error("Could not get lyrics from Metadata!");
		return undefined;
	}

	reply.lines = lyrics.split("\n").map(x => ({ text: x }));
	return reply;
}
