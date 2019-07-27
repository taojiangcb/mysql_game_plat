import { PlatBaseSvr } from "./PlatBaseSvr";
import { RespBase, BaseThirdUserIdResp } from "../RESUL";
import { platConfigService } from "../controllers/PlatConfigOA";
import { ERROR_CODE, ERROR_MSG } from "../ErrorCode";
import { Log } from "../log/Log";
import { sendUrlRequest } from "../mgr/NetMgr";
import { platUsersDB } from "../mysql_plat_users/PlatUsersDB";
const crypto = require("crypto");

export class PlatWxSvr extends PlatBaseSvr {
    constructor(){ super() }

    async login(ctx):Promise<RespBase> {
        var body = ctx.request.body;
        let {platId,gameId} = body;

        let platConfig = await platConfigService.getConfigByCache(platId,gameId);
        if(!platConfig) {
            return new RespBase(false,ERROR_CODE.PLAT_INFO_6001,ERROR_MSG.PLAT_INFO_6001);
        }

        let wxResp = await this.validateLogin(body);
        if (wxResp.errMsg) return new RespBase(false, ERROR_CODE.ERROR_5001, wxResp.errMsg);

        let data = wxResp.data;
        var openId = data.openid, userId = '', unionId = data.unionId;
        var sKey = data.session_key;

        if (body.platUser.content) {
            var iv = body.platUser.content.iv;
            var encryptData = body.platUser.content.encryptData;
            // 解密获取微信账号唯一id
            unionId = this.unPackEncryptedData(encryptData, iv, sKey);
        }

        let userDao = platUsersDB.sysUserDAO(openId);
        let userPlat = await userDao.findOne({
            where:{open_id:openId,plat_id:platId,game_id:gameId,}
        })
        if(userPlat) {
            userId = userPlat.user_id;
        }
        else {
            userId = this.generalUserId();
        }

    }

    async validateLogin(body:any) {
          // 从缓存红获取请求的APPID, SECRET
          let result: WxUserIdResp = {};
          let {platId,gameId} = body;
          var platConfig = await platConfigService.getConfigByCache(platId, gameId);
          if (!platConfig) {
              result.errMsg = `平台${platId}:${gameId}信息不存在`;
              Log.errorLog(result.errMsg);
              return result;
          }
          let data: WxLoginResp;
          var serverConfig = JSON.parse(platConfig.server_config);
          Log.log('获取到的服务配置信息：' + platConfig.server_config);
          if (serverConfig) {
              var d = { appid: serverConfig.APPID, secret: serverConfig.SECRET, js_code: body.platUser.code, grant_type: "authorization_code" };
              data = <WxLoginResp>await sendUrlRequest("https://api.weixin.qq.com/sns/jscode2session", d, "GET");
              if (!!data.errcode) {
                  result.errMsg = `${data.errcode}: ${data.errmsg}`;
                  return result;
              }
              result.data = data;
          }
          return result;
    }

     /**
     * 微信数据解密
     * @param encrypted 
     * @param iv 
     */
    unPackEncryptedData(encrypted, iv, key) {
        if (!encrypted || !iv || !key) return;
        try {
            // logUtil.error("测试解密" + encrypted + "," + iv + "," + key);
            var Bencrypted = new Buffer(encrypted, 'base64');
            var Biv = new Buffer(iv, 'base64');
            var Bkey = new Buffer(key, 'base64');
            // 解密
            var decipher = crypto.createDecipheriv('aes-128-cbc', Bkey, Biv)
            // 设置自动 padding 为 true，删除填充补位
            decipher.setAutoPadding(true)
            var decoded = decipher.update(Bencrypted, 'binary', 'utf8')
            decoded += decipher.final('utf8')
            decoded = JSON.parse(decoded)

        } catch (err) {
            // logUtil.error("解密出错" + err.stack);
            console.log(err, encrypted, iv, key);
        }
        // logUtil.error("解密结束");
        return decoded && decoded.unionId;
    }
}

/**
 * https://developers.weixin.qq.com/miniprogram/dev/api-backend/auth.code2Session.html
 */
interface WxLoginResp {
    openid: string;
    session_key: string;
    unionId: string; // 文档上是 unionid
    errcode: number;
    errmsg: string;
}

interface WxUserIdResp extends BaseThirdUserIdResp {
    data?: WxLoginResp;
}
