import { Context } from "koa";
import { cacheMgr } from "../mgr/Mgr";
import { platConfigService } from "../controllers/PlatConfigOA";
import moment = require("moment");
const uuidv1 = require("uuid");
const md5Hex = require('md5-hex');

export class PlatBaseSvr {

    constructor(){}
    
    async login(ctx:Context):Promise<iRespBase> { return null; }


    /**
     * 生成用户token
     * @returns {Promise<string>}
     */
    generalToken() {
        return 'gameplat_' + moment().format('YYYYMMDDHmmss') + '_' + uuidv1();
    }

    /**
     * 生成平台ID
     * @returns {Promise<string>}
     */
    generalUserId() {
        return md5Hex('zx_' + moment().format('YYYYMMDDHmmss') + '_' + uuidv1());
    }
}