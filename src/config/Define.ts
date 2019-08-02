export interface IConfig {
    my_sql_plat_oa:{
        connectionLimit:number;
        host:string;
        port:number;
        user:string;
        password:string;
        database:string;
        tables?:{
            sys_user?:number,
            sys_user_login?:number,
            sys_user_plat?:number,
            sys_user_game?:number,
        };
    },
    my_sql_plat_users:{
        connectionLimit:number;
        host:string;
        port:number;
        user:string;
        password:string;
        database:string;
        tables?:{
            sys_user?:number,
            sys_order?:number
        };
    },
    redis:{
        ip:string;
        port:number;
        select:number;
        flag:{
            auth_pass:string
        }
    }
    setting:{}
}

export const Define = {
    writeLogFile:true,
    rootPath:"",
    port:1234,
}

export const PlatIds = {
    WX:1001,
    QQ:1002,
    FACE_BOOK:1003
}

export class SDKUser {
    zxId: string;
    name: string;
    avatar: string;
    loginToken: string;
    money: number;
    constructor(zxId:string,name:string,avatar:string,loginToken:string,money:number){
        this.zxId = zxId;
        this.name = name;
        this.avatar = avatar;
        this.loginToken = loginToken;
        this.money = money;
    }
}

export class PlatUser {
    userId: string;
    sKey: string;
    constructor(userId:string,sKey:string) {
        this.userId = userId;
        this.sKey = sKey;
    }
}

export enum ADMINS_TYPE {
    admin = '超级管理员',
    game = '游戏管理员'
}

export const REDIS_KEY = { 
    PLAT_CONFIGS:"platConfigs",
    REDIS_TOKEN:'redis_token',
}

export var SDK_MODE = {
    DEBUG:0,                    //开发
    TEST:1,                     //线上测试
    ONLINE:2,                   //线上生产
}