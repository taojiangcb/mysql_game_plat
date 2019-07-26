
import { Context } from "koa";
import { TABLE_NAME } from "../mysql_define/MySqlDefine";
import { platDB } from "../mysql_game_plat/PlatDB";
import { Constant } from "../iProtocol";
import { sys_admin_table, sys_admin_attr } from "../mysql_game_plat/tables/sys_admins";
import { platRedis } from "../redis_clients/PlatRedis";
import { ADMINS_TYPE, REDIS_KEY } from "../config/Define";
import sequelize = require("sequelize");
import { ISysPlatConfigDAOAtt } from "../mysql_game_plat/tables/sys_plat_config";
import { cacheMgr } from "../mgr/Mgr";

/**
 * 判断是否有此员工信息
 * @param identity 
 * @param pwd 
 */
async function existEmployee(identity:string,pwd:string) {
    var employeeDao = platDB.mysql_client.getTable<sys_admin_table,sys_admin_attr>(TABLE_NAME.sys_admins);
    var data = await employeeDao.findOne({
        where:{
            identity:identity,
            pwd:pwd
        }
    })
    return data;
}

/**
 * 验证session
 * @param ctx 
 */
async function validate_session(ctx: Context) {
    var body = ctx.request.body;
    if(ctx.headers["sessionkey"]) {
        var sessionKey = ctx.headers["sessionkey"] + Constant.REDIS_CONFIG_SESSION;
        var existId:string = await platRedis.redis_client.getString(sessionKey);
        if(existId) return true;
    }
    return false;
}

/**
 * 
 * @param adminId 
 */
async function isSuperAdmin(adminId:string) {
    var admin = await platDB.sysAdminDAO.findOne({where:{ identity:adminId }})
    if(admin && admin.promise == ADMINS_TYPE.admin) {
        return true;
    }
    return false;
}

/**
 * 获取登陆得用户信息
 * @param ctx 
 */
async function getLoginAdmin(ctx: Context) {
    if(ctx.headers["sessionkey"]) {
        var sessionKey = ctx.headers["sessionkey"];
        var adminInfo = await platDB.sysAdminDAO.findOne({where:{identity:sessionKey}});
        if(adminInfo) {
            return adminInfo;
        }
    }
    return null;
}

/**包含还有戏的所有用户 */
async function selectAdminByGame(gameId:number) {
    var sqlCmd:string = `select * from sys_admins a where a.material like CONCAT('%','${gameId}','%')`;
    var res = await platDB.dbClient.query(sqlCmd,{type:sequelize.QueryTypes.SELECT});
    return res;
}

async function getConfigByCache(platId:number,gameId:number) {
    var list:ISysPlatConfigDAOAtt[] = cacheMgr.get(REDIS_KEY.PLAT_CONFIGS);
    if(list) {
        for(var i = 0; i < list.length; i++ ) {
            var element = list[i];
            if(element.game_id === gameId && platId === element.plat_id) return element;
        }
    }
    return null;
}

export var platConfigService = {
    validate_res:validate_session,
    existEmployee:existEmployee,
    isSuperAdmin:isSuperAdmin,
    getLoginAdmin:getLoginAdmin,
    selectAdminByGame:selectAdminByGame,
    getConfigByCache:getConfigByCache,
}