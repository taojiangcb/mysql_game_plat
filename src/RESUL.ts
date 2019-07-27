import { Context } from "koa";
import { Interface } from "readline";

export class RespBase {
    success: boolean;
    code: number;
    msg: string;
    data: any;
    note?: string;
    constructor(success: boolean, code: number, msg: string, data?: any, note?: string) {
        this.success = success;
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.note = note;
    }
}

export function sendResponse(ctx:Context,body:RespBase | string):void {
    if(typeof body === "string") {
        ctx.response.body = body;
    }
    else {
        ctx.response.body = JSON.stringify(body);
    }
}

/** 平台登录接口返回 **/
export interface iPlatLoginResp {
    user?:mgsdk.iPlatUser,
}

/**获取平台接口返回 */
export interface iPlatInfoResp {
    cli_config?:any
}


export interface BaseThirdUserIdResp {
    /**
     * 可能的错误信息
     */
    errMsg?: string;
    /**
     * 第三方登录接口返回的数据
     */
    data?: any;
    /**
     * 可能的堆栈信息
     */
    stack?: string;
}