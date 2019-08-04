/**日志文件处理 */

import log4js = require("log4js");
import { Define } from "../config/Define";
import path = require("path");


//配置 Console
var ca: log4js.ConsoleAppender = {
    type: "console"
}

//配置 logFIle
var logFileAppender: log4js.FileAppender = {
    type: "file",
    filename: path.resolve(Define.rootPath,"./logs/out/logOut.log"),
}

//配置info 追逐
var infoFileAppender: log4js.DateFileAppender = {
    type: "dateFile",
    filename: path.resolve(Define.rootPath,"./logs/info/info"),
    pattern: "-yyyy-MM-dd-hh.log",
    alwaysIncludePattern:true,
    layout:{type:"basic"},
    keepFileExt:false,
    encoding:"utf-8",
    daysToKeep:30,
}

//配置error 文件
var errorFileAppender:log4js.FileAppender = {
    type:"file",
    filename:path.resolve(Define.rootPath,"./logs/err/err.log")
}

let logCfg: log4js.Configuration = {
    appenders: {
        out: ca,
        file: logFileAppender,
        info: infoFileAppender,
        error:errorFileAppender,
    },
    categories: {
        default: { appenders: ['out','info','error'], level: 'all' },
        out:{ appenders: ['out'], level: 'all' },
        file:{appenders: ['file'], level: 'all' },
        info:{appenders: ['info'], level: 'info' },
        error:{appenders: ['error'], level: 'error' },
    }
}


var outLogger// = log4js.getLogger("out");
var fileLogger// = log4js.getLogger("file");
var infoLogger// = log4js.getLogger("info");
var errorLogger //= log4js.getLogger("error");

function log(msg: string, ...args) {
    outLogger && outLogger.debug(msg, args);
    if (Define.writeLogFile) {
        fileLogger.debug(msg, args);
    }
}

function infoLog(msg:string,...args) {
    infoLogger && infoLogger.info(msg,args);
}

function errorLog(msg:string,...args) {
    errorLogger && errorLogger.error(msg,args);
}

type ProcessOpts = {
    process_name:string,
    process_id:number,
    appDir:string
}

/**
 * 
 * @param child_process_opt 子进程的配置修改，如果不传那就是主进程
 */
function initConfig(child_process_opt?:ProcessOpts){

    if(child_process_opt) {
        let basePath = child_process_opt.appDir
        logFileAppender.filename = path.resolve(basePath,`./logs/out/${child_process_opt.process_name}_${child_process_opt.process_id}_logOut.log`);
        infoFileAppender.filename = path.resolve(basePath,`./logs/info/info_${child_process_opt.process_name}_${child_process_opt.process_id}`);
        errorFileAppender.filename = path.resolve(basePath,`./logs/err/${child_process_opt.process_name}_${child_process_opt.process_id}_err.log`);
    }
    
    log4js.configure(logCfg);

    outLogger = log4js.getLogger("out");
    fileLogger = log4js.getLogger("file");
    infoLogger = log4js.getLogger("info");
    errorLogger = log4js.getLogger("error");
}

export var Log = { 
    initConfig:initConfig,
    log: log, 
    infoLog:infoLog, 
    errorLog:errorLog
};