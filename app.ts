import Koa = require("koa");
import Router = require("koa-router");
import fs = require("fs");
import { IConfig, Define } from "./src/config/Define";
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
import { platUsersDB } from "./src/mysql_plat_users/PlatUsersDB";
import { managerInit, childProcessMgr } from "./src/mgr/Mgr";
import { simpleError } from "./src/error/ErrorHandler";

import cluster = require("cluster");
import cp = require("child_process")
import { Log } from "./src/log/Log";
import { SocketServer, WSOpts } from "./src/websocket/SocketServer";


var app = new Koa();
let router = new Router();
let svrPath: string = "/src/httpServers";
Define.rootPath = __dirname;

//初始化日志
Log.initConfig();

/**初始化管理类 */
managerInit();

/** * 当node 进程崩溃的时候处理 */
process.addListener("uncaughtException", (err: Error) => {
    if (err.message) { Log.errorLog(err.message); }
    if (err.stack) { Log.errorLog(err.stack); }
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
    if (err.message) { Log.errorLog(err.message); }
    if (err.stack) { Log.errorLog(err.stack); }
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
    let child_opt = {auto_restart:false,receive_mess_call:message=>{Log.log(message)}}
    childProcessMgr.fork(ts_path,child_opt,[],forkOpts);
}

function startWebSocketSvr() {
    let opts:WSOpts = {
        port:3306,
        check_out_time : 10000
    }
    let wsSvr = new SocketServer(opts);
}

appStart();
startWebSocketSvr();
startChildProcess();