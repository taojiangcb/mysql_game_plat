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
import { managerInit } from "./src/mgr/Mgr";

var app = new Koa();
let router = new Router();
let svrPath: string = "/src/httpServers";
Define.rootPath = __dirname;

/** * 当node 进程崩溃的时候处理 */
process.addListener("uncaughtException", (err: Error) => {
    if (err.message) {
        Log.errorLog(err.message);
        console.log(err.message);
    }
    if (err.stack) {
        Log.errorLog(err.stack);
        console.log(err.stack);
    }
})

/*** 当node 进程退出时候处理 */
process.addListener("exit", (code: number) => {
    console.log("exit code" + code);
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
                console.info(`注入:${url}`);
                router[method_func](funs[1],mapping[url]);
            }
            else {
                console.log("未知服务:" + url);
            }
        }
    });
}

/**
 * 当node 进程崩溃的时候处理
 */
process.addListener("uncaughtException", (err: Error) => {
    if (err.message) {
        console.log(err.message);
    }
    if (err.stack) {
        console.log(err.stack);
    }
})

/**
 * 当node 进程退出时候处理
 */
process.addListener("exit", (code: number) => {
    console.log("exit code" + code);
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
console.log(Define);

let testSvr;

async function appStart() {

    managerInit();

    /** 初始化数据库 */
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
    initHttpServers();
    
    app.use(koaCors({credentials:true}))
    app.use(bodyparser({enableTypes:["json","from","xml"]}))
    app.use(login_validate);
    app.use(router.routes());
    testSvr = app.listen(Define.port);
    app.onerror = (err:Error)=>{
        var msg = err.message || "";
        var stack = err.stack || "";
        var err_msg = `${msg}==${stack}`
        Log.errorLog(err_msg);
    }
    Log.infoLog(`server runing on port ${Define.port}`);
}
appStart();

module.exports = testSvr;