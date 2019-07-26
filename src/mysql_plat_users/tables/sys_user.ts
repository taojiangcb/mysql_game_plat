import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_user;

export interface sys_user_attrs {
    zx_id?:string;
    money?:number;
    user_name?:string;
    pwd?:string;
    name?:string;
    avatar?:string;
    login_token?:string;
    create_time?:number;
    modify_time?:number;
}

/*** sequelize define 之后操作的对象 的类型定义 */
export interface sys_user_table extends Instance<sys_user_attrs>,sys_user_attrs {}

export var column:sequelize.DefineAttributes = {
    zx_id: { type: sequelize.STRING(64), primaryKey: true, allowNull: false },
    money: { type: sequelize.DECIMAL(10), defaultValue: 0 },
    user_name: { type: sequelize.STRING(50) },
    pwd: { type: sequelize.STRING(50) },
    name: { type: sequelize.STRING(100) },
    avatar: { type: sequelize.STRING(300) },
    login_token: { type: sequelize.STRING(300) },
    create_time: { type: sequelize.DATE, defaultValue: new Date() },
    modify_time: { type: sequelize.DATE, defaultValue: new Date() }
}

export var opts:sequelize.DefineOptions<sys_user_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;