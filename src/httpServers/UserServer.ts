import { Context } from "koa";
import { platMgr } from "../mgr/Mgr";
import { platRedis } from "../redis_clients/PlatRedis";
import { REDIS_KEY } from "../config/Define";
import { BaseResp } from "../iProtocol";
import { userController } from "../controllers/UserController";
import { ERROR_CODE, ERROR_MSG } from "../ErrorCode";


/**
 * 用户登录
 * @param ctx 
 * @param next 
 */
async function login(ctx:Context,next) {
    let body = ctx.request.body;
    let {platId,gameId} = body;   
    let platSvr = platMgr.getPlatInstance(platId);
    ctx.response.body = await platSvr.login(ctx);
}

/**
 * 验证用户登录的token
 * @param ctx 
 * @param next 
 */
async function validateLoginToken(ctx:Context,next) {
    let body = ctx.request.body;
    let {userId,loginToken} = body;
    let res = await userController.validateLoginToken(userId,loginToken);
    ctx.response.body = res ? new BaseResp(true,0,"") : new BaseResp(false,ERROR_CODE.ERROR_1006,ERROR_MSG.ERROR_1005);
}

module.exports = {
    "POST /userServer/login":login,
    "POST /userServer/validateLoginToken":validateLoginToken
}