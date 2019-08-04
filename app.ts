import Koa = require("koa");
import Router = require("koa-router");
import fs = require("fs");
import { IConfig, Define } from "./src/config/Define";
import { Log } from "./src/log/Log";
import http = require("http");
import path = require("path");
import { mySqlMgr } from "./src/database/mysqlDao/MySqlDBMgr";
import { game_plat_oa_define, game_plat_users_define } from "./src/mysql_define/MySqlDefine";
import { platDB } from "./src/mysql_game_plat/PlatDB";

import redis = require("redis");
import { platRedis } from "./src/redis_clients/PlatRedis";
import { RedisHelp } from "./src/database/redisBase/RedisHelp";

import session = require("koa-session");
import { login_validate } from "./src/middlewares/login_validate";

import bodyparser = require("koa-bodyparser");
import koaCors = require("koa-cors");
import { whereStatic } from "sequelize";
import { ws } from "./src/websocket/WebSocketServer";
import { platUsersDB } from "./src/mysql_plat_users/PlatUsersDB";
import { managerInit, childProcessMgr } from "./src/mgr/Mgr";
import { simpleError } from "./src/error/ErrorHandler";

import cluster = require("cluster");
import cp = require("child_process")

Log.initConfig();


var app = new Koa();
let router = new Router();
let svrPath: string = "/src/httpServers";
Define.rootPath = __dirname;

managerInit();

/** * 当node 进程崩溃的时候处理 */
process.addListener("uncaughtException", (err: Error) => {
    if (err.message) {
        Log.errorLog(err.message);
    }
    if (err.stack) {
        Log.errorLog(err.stack);
    }
})

/*** 当node 进程退出时候处理 */
process.addListener("exit", (code: number) => {
    console.log("exit code" + code);
    childProcessMgr.killAll();
});


/**初始化Http服务接口 */
function initHttpServers(): void {
    var server_files: string[];
    var files = fs.readdirSync(`${__dirname}${svrPath}`);
    server_files = files.filter((f) => {
        return f.endsWith(".js");
    }, this);

    server_files.forEach(f => {
        let mapping = require(`${__dirname}${svrPath}/${f}`);
        for (var url in mapping) {
            let funs: string[] = url.split(/\s+/i);
            var method_func:string = funs[0].toLowerCase();
            if(router[method_func]) {
                Log.log(`注入:${url}`);
                router[method_func](funs[1],mapping[url]);
            }
            else {
                Log.log("未知服务:" + url);
            }
        }
    });
}

/**
 * 当node 进程崩溃的时候处理
 */
process.addListener("uncaughtException", (err: Error) => {
    if (err.message) {
        Log.errorLog(err.message);
    }
    if (err.stack) {
        Log.errorLog(err.stack);
    }
    childProcessMgr.killAll();
})

/**
 * 当node 进程退出时候处理
 */
process.addListener("exit", (code: number) => {
    Log.errorLog("exit code " + code);
});

var config_path: string = `config_${process.env.NODE_ENV}.json`;
export var config: IConfig = JSON.parse(fs.readFileSync(__dirname + '/' + config_path).toString());

var define_pro = Define;
var overrideDefine = Object.assign(define_pro, config.setting);
for (const key in overrideDefine) {
    if (overrideDefine.hasOwnProperty(key)) {
        const element = overrideDefine[key];
        Define[key] = element;
    }
}

// let testSvr;

async function appStart() {


    /** 初始化平台数据库 */
    platDB.mysql_client = await mySqlMgr.createMySql(game_plat_oa_define.opts());
    var module_url:string = path.join(__dirname,"src/mysql_game_plat/tables");
    await platDB.mysql_client.loadModel(module_url);

    /**初始化平台用户数据库 */
    platUsersDB.mysql_client = await mySqlMgr.createMySql(game_plat_users_define.opts())
    var module_url = path.join(__dirname,"src/mysql_plat_users/tables");
    await platUsersDB.mysql_client.loadModel(module_url);

    /**Redis  */
    var redisOpt:redis.ClientOpts = {
        host:config.redis.ip,
        port:config.redis.port,
        auth_pass:config.redis.flag.auth_pass,
        db:config.redis.select
    }

    //var webSocketServer:ws.WebSocketServer = new ws.WebSocketServer();
    //webSocketServer.listenerToServer(app);

    var redisHelp:RedisHelp = new RedisHelp();          
    await redisHelp.init(redisOpt);
    platRedis.redis_client = redisHelp;
    app.on("error",simpleError);

    /**动态注入 http 服务 */
    initHttpServers();

    app.use(koaCors({credentials:true}))
    app.use(bodyparser({enableTypes:["json","from","xml"]}))
    app.use(login_validate);
    app.use(router.routes());
    http.createServer(app.callback).listen(Define.port);
    Log.infoLog(`server runing on port ${Define.port}`);
}

function startChildProcess() {
    var ts_path = path.join(__dirname,"src/worker","test_worker.js");
    console.log(`------${ts_path}`);

    let env_ = Object.assign({appDir:__dirname},process.env)
    let forkOpts = {execArgv:[],env:env_,silent:false}
    let child_opt = {auto_restart:false,receive_mess_call:receive_child_process_msg}
    childProcessMgr.fork(ts_path,child_opt,[],forkOpts);
    
    // cp_map[childProcess.pid] = childProcess;
    // childProcess.on("error",err=>{
    //     Log.log(err.message);
    //     Log.log(err.stack);
    // })

    // childProcess.on("exit",(code,signal)=>{
    //     Log.log(`exit code:${code},signal:${signal}`);
    // })

    // childProcess.on("close",(code,signal)=>{
    //     Log.log(`close code:${code},signal:${signal}`);
    // })

    // childProcess.on("message",(message,server)=>{
    //     Log.log(message);
    // })
}

function receive_child_process_msg(message:string) {
    Log.log(message);
}

startChildProcess();
appStart();

// function onListenerFail(worker:cluster.Worker) {
//     worker.kill();
//     Log.errorLog(`worker listener fail ${worker.id}`);
// }


// var timerouts = [];
// if(cluster.isMaster) {

//     var len = 1;
//     cluster.on("disconnect",worker=>{
//         Log.infoLog(`工作进程 ${worker.id} 已经断开`);
//     })

//     cluster.on("fork",worker=>{
//         timerouts[worker.id] = setTimeout(onListenerFail,2000,worker);
//     })

//     cluster.on("online",(worker)=>{
//         Log.infoLog(`工作进程被衍生后响应${worker.id}`)
//     })

//     cluster.on("listening",(worker,address)=>{
//         clearTimeout(timerouts[worker.id]);
//         Log.infoLog(`listening success ${worker.id},address is ${JSON.stringify(address)}`);
//     })

//     cluster.on("exit",(worker,code,signal)=>{
//         clearTimeout(timerouts[worker.id]);
//         if(worker.exitedAfterDisconnect === true) {
//             Log.infoLog(`process is close by id ${worker.id}`);
//         }
//         else {
//             Log.errorLog('工作进程 %d 关闭 (%s). 重启中...',worker.process.pid, signal || code);
//             cluster.fork();
//         }
//     })
//     Log.infoLog("begin fork......");
//     for(var i = 0; i < len; i++) {
//         cluster.fork();
//     }
// }
// else {
//     // Log.log("fork process ....");
//     appStart();
// }


// module.exports = testSvr;