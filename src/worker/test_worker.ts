import { Log } from "../log/Log";
import path = require("path")

let log_child_opts = {
    process_name:path.parse(__filename).name,
    process_id:process.pid,
    appDir:path.join(process.env.appDir)
}

Log.initConfig(log_child_opts);
Log.log("----------------test_worker-------------");
console.log(JSON.stringify(log_child_opts));

setInterval(()=>{
    Log.log(`${JSON.stringify(log_child_opts)}`);
    process.send(`this message from ${log_child_opts.process_name}`);
},1000)

process.on('uncaughtException', (err) => {
    Log.errorLog(`err:${err.stack || ""} \n ${err.message || ""}`)
});