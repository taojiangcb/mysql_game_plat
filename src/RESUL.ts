import { Context } from "koa";

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