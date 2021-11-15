// Source: https://github.com/aqua-lzma/OwOify/blob/master/owoify.js
// Edited to be static and ES6
const options = {
	rltow: true,
	yaftern: true,
	repeaty: true,
	replaceWords: true,
	wordMap: {
		love: "wuv",
		mr: "mistuh",
		dog: "doggo",
		cat: "kitteh",
		hello: "henwo",
		hell: "heck",
		fuck: "fwick",
		fuk: "fwick",
		shit: "shoot",
		friend: "fwend",
		stop: "stawp",
		god: "gosh",
		dick: "peepee",
		penis: "peepee",
		damn: "darn"
	},
	doStutter: true,
	stutterChance: 0.1,
	doPrefixes: true,
	prefixChance: 0.05,
	prefixes: [
		"OwO",
		"*unbuttons shirt*",
		"*nuzzles*",
		"*waises paw*",
		"*notices bulge*",
		"*blushes*",
		"*giggles*"
	],
	doSuffixes: true,
	suffixChance: 0.15,
	suffixes: [
		"(ﾉ´ з `)ノ",
		"( ´ ▽ ` ).｡ｏ♡",
		"(´,,•ω•,,)♡",
		"(*≧▽≦)",
		"ɾ⚈▿⚈ɹ",
		"( ﾟ∀ ﾟ)",
		"( ・ ̫・)",
		"( •́ .̫ •̀ )",
		"(▰˘v˘▰)",
		"(・ω・)",
		"✾(〜 ☌ω☌)〜✾",
		"(ᗒᗨᗕ)",
		"(・`ω´・)",
		":3",
		">:3",
		"hehe",
		"xox",
		">3<",
		"murr~",
		"UwU",
		"*gwomps*"
	]
};

options.prefixes.sort((a, b) => a.length - b.length);
options.suffixes.sort((a, b) => a.length - b.length);

function replaceAll(text, map) {
	let source = Object.keys(map).map(i => `\\b${i}`);
	let re = new RegExp(`(?:${source.join(")|(?:")})`, "gi");
	return text.replace(re, match => {
		let out = map[match.toLowerCase()];
		// Not very tidy way to work out if the word is capitalised
		if ((match.match(/[A-Z]/g) || []).length > match.length / 2) out = out.toUpperCase();
		return out;
	});
}

function weightedRandom(list) {
	// Returns a random choice from the list based on the length of string in the list
	// Shorter strings are proportionally more likely to be picked
	// ** List should already be sorted shortest to longest **
	let max = list[list.length - 1].length + 1;
	let acc = 0;
	let weights = list.map(i => acc += max - i.length);
	let random = Math.floor(Math.random() * acc);
	for (var [index, weight] of weights.entries()) 
		if (random < weight) break;
	
	return list[index];
}

export default function owoify(text) {
	// Replace words
	if (options.replaceWords) 
		text = replaceAll(text, options.wordMap);
		
	// OwO
	if (options.rltow) {
		text = text.replace(/[rl]/gi, match =>
			match.charCodeAt(0) < 97 ? "W" : "w"
		);
	}
	// Nya >;3
	if (options.yaftern) {
		text = text.replace(/n[aeiou]/gi, match =>
			`${match[0]}${match.charCodeAt(1) < 97 ? "Y" : "y"}${match[1]}`
		);
	}
	// Repeaty wepeaty
	if (options.repeaty) {
		text = text.replace(/\b(?=.*[aeiou])(?=[a-vx-z])[a-z]{4,}y\b/gi, match =>
			`${match} ${match.charCodeAt(0) < 97 ? "W" : "w"}${match.match(/.[aeiouy].*/i)[0].slice(1)}`
		);
	}
	// S-stutter
	if (options.doStutter) {
		text = text.split(" ").map(word => {
			if (word.length === 0 || word[0].match(/[a-z]/i) == null) return word;
			while (Math.random() < options.stutterChance) 
				word = `${word[0]}-${word}`;
				
			return word;
		}).join(" ");
	}
	// Prefixes
	if (options.doPrefixes) {
		if (Math.random() < options.prefixChance) 
			text = `${weightedRandom(options.prefixes)} ${text}`;
			
	}
	// Suffixes
	if (options.doSuffixes) {
		if (Math.random() < options.suffixChance) 
			text = `${text} ${weightedRandom(options.suffixes)}`;
			
	}
	return text;
}

