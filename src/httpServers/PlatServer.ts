import { Context } from "koa";
import { platRedis } from "../redis_clients/PlatRedis";
import { ISysPlatConfigDAO, ISysPlatConfigDAOAtt } from "../mysql_game_plat/tables/sys_plat_config";
import { RespBase, sendResponse, iPlatInfoResp } from "../RESUL";
import { ERROR_CODE, ERROR_MSG } from "../ErrorCode";
import { platDB } from "../mysql_game_plat/PlatDB";
import sequelize = require("sequelize");
import { REDIS_KEY } from "../config/Define";
import { cacheMgr } from "../mgr/Mgr";
import { platConfigService } from "../controllers/PlatConfigOA";
import { login_validate } from "../middlewares/login_validate";
import { RedisClient } from "redis";


async function getPlatInfo_redis(ctx:Context,next) {
    var body = ctx.request.body;
    var platConfig:ISysPlatConfigDAO;
    let {platId,gameId} = body;
    if(platId && gameId) {
        var exist:Boolean = await platRedis.redis_client.exists(REDIS_KEY.PLAT_CONFIGS);
        var key:string = `${platId}_${gameId}`;
        if(exist) {
            var cache = await platRedis.redis_client.hget(REDIS_KEY.PLAT_CONFIGS,key);
            platConfig = JSON.parse(cache);
            sendResponse(ctx,new RespBase(true,0,'',platConfig));
            return;
        }
        if(!platConfig) {
            platConfig = await platDB.sysPlatServerConfigDAO.findOne({
                where:{
                    game_id:gameId,
                    plat_id:platId,
                    status:1
                }
            })
        }
        if(platConfig) {
            var cache_str:string = JSON.stringify(platConfig);
            if(exist) {
                await platRedis.redis_client.hset(REDIS_KEY.PLAT_CONFIGS,key,cache_str);
            }
            else {
                await platRedis.redis_client.hset(REDIS_KEY.PLAT_CONFIGS,key,cache_str);
                await platRedis.redis_client.expire(REDIS_KEY.PLAT_CONFIGS,60);
            }
            sendResponse(ctx,new RespBase(true,0,'',platConfig));
        }
        else {
            var respBase:RespBase = new RespBase(false,ERROR_CODE.ERROR_1005,ERROR_MSG.ERROR_1005);
            sendResponse(ctx,respBase);
            return;
        }
    }
    else {
        var respBase:RespBase = new RespBase(false,ERROR_CODE.ERROR_5000,ERROR_MSG.ERROR_5000);
        sendResponse(ctx,respBase);
        return;
    }
}

async function getPlatInfo(ctx:Context,next) {
    var body = ctx.request.body;
    var platConfig:ISysPlatConfigDAOAtt[];
    let {plat,gameId} = body;

    let resp:iPlatInfoResp = {}

    if(plat && gameId) {
        let configItem:ISysPlatConfigDAOAtt = null;
        if(!cacheMgr.isExpired(REDIS_KEY.PLAT_CONFIGS)) {
            configItem = await platConfigService.getConfigByCache(plat,gameId) as ISysPlatConfigDAOAtt;
        }
        if(configItem) {
            resp.cli_config = configItem.config;
            sendResponse(ctx,new RespBase(true,0,'',resp));
            return;
        }
        else {
            platConfig = await platDB.sysPlatServerConfigDAO.findAll();
            cacheMgr.set(REDIS_KEY.PLAT_CONFIGS,platConfig,60);
            platConfig.forEach(element => {
                if(gameId === element.game_id && plat === element.plat_id) {
                    configItem = element;
                }
            });
            resp.cli_config = configItem.config;
            sendResponse(ctx,new RespBase(true,0,'',resp));
            return;
        }
    }
    else {
        var respBase:RespBase = new RespBase(false,ERROR_CODE.ERROR_5000,ERROR_MSG.ERROR_5000);
        sendResponse(ctx,respBase);
        return;
    }
}


module.exports = {
    "POST /platServer/getPlatInfo":getPlatInfo,
    "POST /platServer/getPlatInfo_redis":getPlatInfo_redis
}