import { Context } from "koa";
import { platMgr } from "../mgr/Mgr";


async function login(ctx:Context,next) {
    let body = ctx.request.body;
    let {platId,gameId} = body;   
    
    let platSvr = platMgr.getPlatInstance(platId);
    ctx.response.body = await platSvr.login(ctx);
}

module.exports = {
    "POST /userServer/login":login,
}