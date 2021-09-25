/* eslint-disable no-undef */
import "./lib/event.js";
import { updateNowPlaying, updateSeekbar } from "./lib/nowplaying.js";
import { theme, themeToggle, fullscreen } from "./lib/util.js";

theme();
updateNowPlaying();
setInterval(updateSeekbar, 1000);

window.themeToggle = themeToggle;
window.fullscreen = fullscreen;