import { ServerController } from "../ServerController";
import { SocketServer } from "../SocketServer";
import { SocketSession } from "../SocketSession";


export class HelloController extends ServerController {

    constructor(svrName:string,serverIO?:SocketServer) {
        super(svrName,serverIO);
    }

    say_hello(session:SocketSession,protcol:mgsdk.iBaseProcotol) {
        // sample business code ....

        let body:any = protcol.procoBody.body || {};
        body.content = `hellow ${protcol.socketId}`;

        protcol.procoBody.body = body;
        session.send(protcol);
    }
}