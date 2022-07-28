import { Config } from "../../types";

export default await window.np.getConfig() as Config;

window.np.registerConfigChangedCallback(() => window.location.reload());