import { EventEmitter } from "events";
import WebSocket = require("ws")
import { Log } from "../log/Log";

export class SocketSession extends EventEmitter {
    /** 客户端连接 */
    private m_client:WebSocket;    
    /**客户端id */
    clientId:string = "";
    /**socket 心跳状态标记 */
    isAlive = false;
    constructor(client:WebSocket) {
        super();
        this.m_client = client;
        this.isAlive = true;
        /**心跳消息处理 */
        client.on("pong",this.heartbeat.bind(this));
        /**收到消息处理 */
        client.on("message",this.onMessage.bind(this));
    }

    private onMessage(data:WebSocket.Data) {
        try {
            let protocol:mgsdk.iBaseProcotol = JSON.parse(String(data));
            this.emit("message",protocol);
        }
        catch(err) {
            this.errorHandler(err);
        }
    }

    /**
     * 发送到客户端消息
     */
    public send(protocol:mgsdk.iBaseProcotol) {
        if(this.m_client && this.m_client.readyState === WebSocket.OPEN) {
            this.m_client.send(JSON.stringify(protocol),err=>{
                this.errorHandler(err);
            })
        }
        else {
            Log.infoLog(`可能客户端连接断开或者失效,发送消息丢失:${JSON.stringify(protocol)}`);
        }
    }

    private errorHandler(err:Error):void {
        if(err) {
            let msg:string = err.message || err.stack;
            Log.errorLog(`${msg}`)
        }
    }

    private heartbeat():void { 
        this.isAlive = true; 
    }
    get socket() {return this.m_client;}
}