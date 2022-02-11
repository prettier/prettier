import {pathToFileURL} from "node:url"
import path from "node:path"

const entry = pathToFileURL(path.join(process.env.PRETTIER_DIR, "index.js"))

const {default: prettier} = await import(entry);

export default prettier;
