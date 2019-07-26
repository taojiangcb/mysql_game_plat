import { Context } from "koa";
import { Constant } from "../iProtocol";
import { platRedis } from "../redis_clients/PlatRedis";
import { platDB } from "../mysql_game_plat/PlatDB";

/**
 * @param ctx 操作日志写入到数据库
 * @param logContent 
 */
export async function writeLog(ctx:Context,logContent?:string) {
    if(ctx.headers["sessionkey"]) {
        var userIdentity:string = ctx.headers["sessionkey"];
        if(userIdentity) {
            await platDB.sysPlatLogDAO.create({identity:userIdentity,log:logContent});
        }
    }
}