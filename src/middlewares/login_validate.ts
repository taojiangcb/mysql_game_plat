import { debug } from "util";
import { Context } from "koa";
import { BaseResp } from "../iProtocol";
import { ERROR_CODE, ERROR_MSG } from "../ErrorCode";
import { platConfigService } from "../controllers/PlatConfigOA";

export async function login_validate(ctx: Context, next) {
    console.log("action url" + ctx.url);
    var reg:RegExp = /(\/Game\/)?(\/Admin\/)?/gi;
    if(reg.test(ctx.url)) {
        if (ctx.url.startsWith("/Game/login")) {
            return await next();
        }
        else if(ctx.url.startsWith("/Game/")) {
            var bol = await platConfigService.validate_res(ctx);
            if (!bol) {
                ctx.response.body = new BaseResp(false, ERROR_CODE.ERROR_10, ERROR_MSG.ERROR_10);
                return;
            }
        }
    }
    return await next();
}