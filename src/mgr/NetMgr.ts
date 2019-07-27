import { request } from "http";

var domain = require('domain');
var http = require("http");
var https = require("https");
var urlTool = require("url");
import qs = require('querystring');
import { Log } from "../log/Log";

// 通过domain来记录错误
var d = domain.create();
d.on('error', function (err) {
    Log.errorLog('domain error: ' + err); // 通过domain捕获异步异常
});

export class Sender {
    private _url: string;
    private _data: any;
    private _method: string;
    private _converJson: boolean = true;
    private _callBack: Function;
    private _isResultStr: boolean = true;
    constructor(url: string, data: any, method: string, converJson: boolean, callBack: Function, isResultStr: boolean = true) {
        this._url = url;
        this._data = data;
        this._method = method;
        this._callBack = callBack;
        this._tryCount = 0;
        this._converJson = converJson;
        this._isResultStr = isResultStr;
        this._send();
    }

    private _timeId: any;
    private _tryCount: number = 0;
    private _send() {
        this._timeId = setTimeout(this._send.bind(this), 1000);
        this._tryCount++;
        if (this._tryCount > 5) {
            clearTimeout(this._timeId);
            Log.errorLog("重试超时----" + this._url);
            return;
        }

        this.send(this._url, this._data, this._method, (str) => {
            clearTimeout(this._timeId);
            this._timeId = null;
            try {
                this._callBack(str ? JSON.parse(str) : null);
            } catch (e) {
                this._callBack(str);
            }
        }, this._converJson)
    }

    send(url: string, data: any, method: string, callback: Function, converJson: boolean) {
        if (typeof data == "string") {
            data = converJson ? JSON.parse(data) : data;
        }
        var httpTarget = url.indexOf("https") != -1 ? https : http;
        if (method == "GET") {
            url += "?" + qs.stringify(data);
            d.run(function () {
                httpTarget.get(url, function (res) {
                    var alldata = "";
                    res.on('data', function (chunk) {
                        alldata += chunk;
                    });
                    res.on('end', function () {
                        callback(alldata);
                    });
                }).on('error', function (e) {
                    Log.errorLog("Got error: " + e.message);
                });
            });
            return;
        }
        var postData = data;
        if (typeof data !== 'string' && converJson) {
            postData = JSON.stringify(data);
        } else if (typeof data !== 'string') {
            postData = qs.stringify(data);
        }
        var opt = urlTool.parse(url);
        opt.method = "POST";
        opt.headers = {
            'Content-Type': converJson ? 'application/json' : 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        }
        var _self = this;
        d.run(function () {
            var req = httpTarget.request(opt, function (res) {
                if (res.statusCode != 200) {
                    Log.errorLog(`req:${JSON.stringify(opt)}, postData:${postData}, status:${res.statusCode}`);
                }
                // writeLog('HEADERS: ' + JSON.stringify(res.headers));
                var alldata = "";
                var buffs = [];
                var size = 0;
                res.on('data', function (chunk) {
                    buffs.push(chunk);
                    size += chunk.length;
                    // alldata += chunk;
                });
                res.on("end", function () {
                    var buff = Buffer.concat(buffs, size);
                    if (_self._isResultStr) {
                        alldata = buff.toString();
                        callback(alldata);
                    } else {
                        callback(buff);
                    }
                });
                req.on('error', function (e) {
                    Log.errorLog('problem with request: ' + e.message);
                });
            });
            req.write(postData);
            req.end();
        });
    }
}

export function sendToUser(response: any, d: iRespBase | string) {
    response.body = JSON.stringify(d);
}

export async function sendUrlRequest(url: string, data: any, method: string, converJson: boolean = true, isResultStr: boolean = true) {
    return new Promise((resolve, reject) => {
        new Sender(url, data, method, converJson, (res) => {
            resolve(res);
        }, isResultStr);
    });
}

