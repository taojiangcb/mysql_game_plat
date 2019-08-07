import { PlatBaseSvr } from "./PlatBaseSvr";
import { Context } from "koa";
import { platUsersDB } from "../mysql_plat_users/PlatUsersDB";
import { RespBase } from "../RESUL";
import { cacheMgr } from "../mgr/Mgr";
import { platConfigService } from "../controllers/PlatConfigOA";
import { ERROR_CODE, ERROR_MSG } from "../ErrorCode";


export class PlatDevSvr extends PlatBaseSvr {

    async login(ctx:Context) { 
        var body = ctx.request.body;
        let {user,pwd,platId,gameId} = body;

        let platConfig = await platConfigService.getConfigByCache(platId,gameId);
        if(!platConfig) {
            return new RespBase(false,ERROR_CODE.PLAT_INFO_6001,ERROR_MSG.PLAT_INFO_6001);
        }

        var userId = user + pwd;
        let userDao = platUsersDB.sys_user_dao(userId);
        let userData = await userDao.findOne({where:{ user_id:userId }})

        let loginResp:mgsdk.iPlatLoginResp = {};
        let platUser:mgsdk.iPlatUser = {};

        if(!userData) {
            userData = await userDao.create({user_id:userId,avatar:"",nickname:user,plat_id:platId,game_id:gameId,open_id:user});
        }

        platUser.avatar = userData.avatar;
        platUser.naickName = userData.nickname;
        platUser.id = userData.user_id;
        platUser.openId = userData.open_id;
        loginResp.user = platUser;

        return new RespBase(true,0,"",loginResp);
    }
}