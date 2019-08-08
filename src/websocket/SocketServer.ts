import { EventEmitter } from "events";
import { SocketSession } from "./SocketSession";
import WebSocket = require("ws");
import http = require("http")
import { ServerController } from "./ServerController";
import { Log } from "../log/Log";


/**
 * socket 服务的参数配置
 */
export interface WSOpts extends WebSocket.ServerOptions {
    check_out_time:number;          //检查time out 的时间
}

export class SocketServer extends EventEmitter {

    /**启动服务时的参数 */
    private opts:WSOpts;

    /*** socket svr 服务*/
    private serverIO:WebSocket.Server;

    /**连接上来的客户端 */
    private sessionMap:Map<string,SocketSession>;

    /**被连接的次数 */
    private link_count:number = 0;

    /**检查 客户端断线时 interval Id */
    private timeOutChkId:NodeJS.Timer;

    /**注入到服务的消息业务逻辑处理 */
    private controllerMaps:Map<string,ServerController>;

    constructor(opts:WSOpts) {
        super()
        this.opts = opts;
        this.sessionMap = new Map();
        this.controllerMaps = new Map();
        this.createServerIO();
    }

    /** 注册一些消息处理服务，由子级对象覆盖实现 */
    protected injiectSvrController(){
        //sample add ServerController code;
    }

    /** 注册业务消息处理 */
    registerController<T extends ServerController> (svrName:string, T) {
        let controller:ServerController = new T(svrName);
        controller.serverIO = this;
        this.controllerMaps.set(svrName,controller);
    }

    /** 计时器检查那些 失去心跳的连接 */
    private checkTimeOut():void {
        for(let [k,v] of this.sessionMap) {
            if(v.isAlive === false) return v.socket.terminate();
            v.isAlive = false;
            v.socket.ping();
        }
    }

    /**
     * 创建服务
     */
    private createServerIO() {
        this.serverIO = new WebSocket.Server(this.opts);
        this.serverIO.on("connection",this.connectionHandler.bind(this));
        this.serverIO.on("error",err=>{
            Log.errorLog(`${err.message}, stack:${err.stack}`);
        })
        this.timeOutChkId = setInterval((...args)=>{
            for(let [k,v] of this.sessionMap) {
                if(v.isAlive === false) return v.socket.terminate();
                v.isAlive = false;
                v.socket.ping();
            }
        },1000);
        Log.log(`start websocket server...`);
    }

    private connectionHandler(socket: WebSocket, request: http.IncomingMessage) {
        this.link_count++;
        let session = new SocketSession(socket);
        session.clientId = this.link_count + "__link_id";
        session.isAlive = true;

        this.sessionMap.set(session.clientId,session);
        /** 告诉客户端当前连接的身份信息 */
        this.send_client_init(session);

        session.socket.on("close",(code,reason)=>{
            Log.infoLog(`this is socket is close by clientId ${session.clientId} code:${code} reason:${reason}`);
            session.isAlive = false;
            this.sessionMap.delete(session.clientId);
        })

        session.on("message",(protocol:mgsdk.iBaseProcotol)=>{
            let controller = this.controllerMaps.get(protocol.procoBody.server);
            if(!controller) {
                Log.infoLog(`无效的服务:${protocol.procoBody.server} protocol:${JSON.stringify(protocol)}`);
                return; 
            }
            
            let session = this.sessionMap.get(protocol.socketId);
            if(!session) {
                Log.infoLog(`无效的客户端对象:${protocol.socketId} protocol:${JSON.stringify(protocol)}`)
                return;
            }

            if(controller && session) {
                controller.doAction(session,protocol);
            }
        })
    }

    /** 客户端当前的连接身份信息 */
    private send_client_init(session:SocketSession):void {
        let protocol:mgsdk.iBaseProcotol = {
            socketId:session.clientId,
            procoBody:{
                action:"initClient",
                server:"__IDENTITY_CONTROLLER__",
            }
        }
        session.send(protocol);
    }

    /** 发送到客户端 */
    send(socketId:string,protocol:mgsdk.iBaseProcotol) {
        let session = this.sessionMap.get(socketId);
        if(session) session.send(protocol);
    }

    dispose() {
        if(this.timeOutChkId) clearInterval(this.timeOutChkId);
        this.serverIO.close();
        this.sessionMap.clear();
        this.controllerMaps.clear();
    }
}