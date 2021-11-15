import type { Config } from "../../types";

const fallback: Config = {
	font: "",
	lfmUsername: "",
	spotify: {
		clientID: "",
		clientSecret: ""
	},
	discordRpc: {
		enabled: false,
		blacklist: []
	}
};

export default Object.assign(fallback, await window.np.getConfig());