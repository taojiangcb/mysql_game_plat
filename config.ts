import { IConfig } from "./src/config/Define";
import fs = require("fs");

var config_path: string = `config_${process.env.NODE_ENV}.json`;
export var config: IConfig = JSON.parse(fs.readFileSync(__dirname + '/' + config_path).toString());