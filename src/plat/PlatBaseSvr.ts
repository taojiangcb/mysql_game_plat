import { Context } from "koa";
import { cacheMgr } from "../mgr/Mgr";
import { platConfigService } from "../controllers/PlatConfigOA";
import moment = require("moment");
import { platRedis } from "../redis_clients/PlatRedis";
import { REDIS_KEY } from "../config/Define";
import { platUsersDB } from "../mysql_plat_users/PlatUsersDB";
import { Log } from "../log/Log";
const uuidv1 = require("uuid");
const md5Hex = require('md5-hex');

export class PlatBaseSvr {

    constructor(){}
    
    async login(ctx:Context):Promise<iRespBase> { return null; }


    /**
     * 生成用户token
     * @returns {Promise<string>}
     */
    generalToken() { return 'gameplat_' + moment().format('YYYYMMDDHmmss') + '_' + uuidv1(); }

    /**
     * 生成平台ID
     * @returns {Promise<string>}
     */
    generalUserId() { return md5Hex('zx_' + moment().format('YYYYMMDDHmmss') + '_' + uuidv1()); }

    /**
     * @param userId 获取loginToken
     */
    async getLoginToken(userId:string) {
         // 生成login_token, 放入redis缓存并设置失效时间，每次请求自动续命
         var token = this.generalToken();
    
         await platRedis.redis_client.setString(REDIS_KEY.REDIS_TOKEN + userId, token);
         await platRedis.redis_client.expire(REDIS_KEY.REDIS_TOKEN + userId, 24 * 60 * 60);
         // await redis.set(Constant.REDIS_TOKEN + zxId, token);
         // await redis.expire(Constant.REDIS_TOKEN + zxId, 24 * 60 * 60);
         Log.infoLog('登录成功,用户id:' + userId + ', 生成token信息:' + token);
         return token;
    }

    /**
     * 保存最后一次的登录时间
     * @param userId 
     */
    async saveLoginTime(userId:string) {
        let login_dao = platUsersDB.sys_user_log_dao(userId);
        let login_data = await login_dao.findOne({where:{user_id:userId}});
        if(login_data) {
            login_data.login_time = Date.now();
            await login_data.save();
        }
        else {
            await login_dao.create({user_id:userId,login_time:Date.now()});
        }
    }
}