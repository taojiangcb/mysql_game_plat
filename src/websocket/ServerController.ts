import { EventEmitter } from "events";
import { SocketSession } from "./SocketSession";
import { SocketServer } from "./SocketServer";

/**
 * 消息解析协议处理的对象
 */
export class ServerController extends EventEmitter {
    
    /** 注册的服务名称 */
    private serverName:string = ""

    /** websocket 的服务 */
    private m_serverIO:SocketServer;

    constructor(svrName:string,serverIO?:SocketServer) {
        super(); 
        this.serverName = svrName;
        this.m_serverIO = serverIO;
    }

    /** 设置 webSocket 服务 */
    set serverIO(svr:SocketServer) { this.m_serverIO = svr;}
    get serverIO() { return this.m_serverIO; }

    /**
     * 
     * 对应的业务处理 protocol.procoBody.body.askId 业务逻辑处理完了之后需要传回去
     * @param session 
     * @param protocol 
     */
    doAction(session:SocketSession,protocol:mgsdk.iBaseProcotol) {
        let method = protocol.procoBody.action;
        let call:Function = this[method];
        call && call.call(this,session,protocol);
    }
}
