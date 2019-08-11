import Koa = require("koa");
import Router = require("koa-router");
import fs = require("fs");
import { IConfig, Define, WS_SERVER } from "./src/config/Define";
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
const koaCors = require("koa2-cors");
import { whereStatic } from "sequelize";
import { platUsersDB } from "./src/mysql_plat_users/PlatUsersDB";
import { managerInit, childProcessMgr } from "./src/mgr/Mgr";
import { simpleError } from "./src/error/ErrorHandler";

import cluster = require("cluster");
import cp = require("child_process")
import { Log } from "./src/log/Log";
import { SocketServer, WSOpts } from "./src/websocket/SocketServer";
import { HelloController } from "./src/websocket/controller/HelloController";
import { config } from "./config";
import os = require("os");

var app = new Koa();
let router = new Router();
let svrPath: string = "/src/httpServers";
Define.rootPath = __dirname;

let httpServer:http.Server = http.createServer(app.callback());
let wsServer:SocketServer;

/**
 * 启用多进程共享网络端口
 */
var mutileProcessStart = function() {
    if(cluster.isMaster) {
        //初始化日志
        Log.initConfig();
        /**初始化管理类 */
        managerInit();
        //startWebSocketSvr();
        //startChildProcess();
        cluster.on("online", worker => { console.log('工作进程被衍生后响应'); })
        cluster.on('listening', (worker, address) => {
            console.log(`工作进程已连接到 ${address.address}:${address.port}`);
        });
    
        const timeouts = [];
        function errorMsg() { console.error('连接出错');}
        cluster.on('fork', (worker) => {timeouts[worker.id] = setTimeout(errorMsg, 10000);});
        cluster.on('listening', (worker, address) => {clearTimeout(timeouts[worker.id]);});
        cluster.on('exit', (worker, code, signal) => {
            clearTimeout(timeouts[worker.id]);
            errorMsg();
        });
        //cpu 的个数
        let len = os.cpus().length;
        for(var i = 0; i < len; i++) { cluster.fork(); }
    }
    else {
        //初始化日志
        Log.initConfig({process_id:process.pid,process_name:"koa-server",appDir:__dirname});
        /**初始化管理类 */
        managerInit();
        httpSvrStart();
    }
}

/**
 * 单进程启动服务
 */
var signleProcessStart = function() {
    //初始化日志
    Log.initConfig();
    /**初始化管理类 */
    managerInit();
    httpSvrStart();
}

var appStart = signleProcessStart;
appStart();

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


/*** 初始化化参数配置 ========================*/
var conf: IConfig = config;
var define_pro = Define;
var overrideDefine = Object.assign(define_pro, conf.setting);
for (const key in overrideDefine) {
    if (overrideDefine.hasOwnProperty(key)) {
        const element = overrideDefine[key];
        Define[key] = element;
    }
}
/*** 初始化化参数配置 end ========================*/

async function httpSvrStart() {

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
        host:conf.redis.ip,
        port:conf.redis.port,
        auth_pass:conf.redis.flag.auth_pass,
        db:conf.redis.select
    }

    //var webSocketServer:ws.WebSocketServer = new ws.WebSocketServer();
    //webSocketServer.listenerToServer(app);
    var redisHelp:RedisHelp = new RedisHelp();          
    await redisHelp.init(redisOpt);
    platRedis.redis_client = redisHelp;
    app.on("error",simpleError);

    /** 先要设置跨域 */
    app.use(koaCors({credentials:true}));
    app.use(bodyparser({enableTypes:["json","from"]}))
    app.use(login_validate);

    /**动态注入 http 服务 */
    initHttpServers();
    app.use(router.routes());
    httpServer.listen(Define.port);
    Log.infoLog(`server runing on port ${Define.port}`);
}


/** * 启动其他辅助线程 */
function startChildProcess() {
    var ts_path = path.join(__dirname,"src/worker","test_worker.js");
    console.log(`------${ts_path}`);
    let env_ = Object.assign({appDir:__dirname},process.env)
    let forkOpts = {execArgv:[],env:env_,silent:false}
    let child_opt = {auto_restart:false,receive_mess_call:message=>{Log.log(message)}}
    childProcessMgr.fork(ts_path,child_opt,[],forkOpts);
}

/**启动webSocket 服务 */
function startWebSocketSvr() {
    let opts:WSOpts = {
        port:Define.wsPort,
        check_out_time : 1000
    }
    wsServer = new SocketServer(opts);
    wsServer.registerController(WS_SERVER.HELLO,HelloController);
}
