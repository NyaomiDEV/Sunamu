const fallback = {
	lfmUsername: "",
	spotify: {
		clientID: "",
		clientSecret: ""
	}
};

export default Object.assign(fallback, await window.np.getConfig());