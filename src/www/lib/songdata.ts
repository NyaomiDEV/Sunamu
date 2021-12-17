import type { SongData } from "../../types";

export default Object.assign({}, await window.np.getSongData()) as SongData;