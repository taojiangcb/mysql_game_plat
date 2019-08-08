import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_user;

export interface sys_user_attrs {
    id?:number;
    user_id?:string;
    open_id?:string;
    game_id?:string;
    plat_id?:string;
    avatar?:string;
    nickname?:string;
    money?:number;
    totalPay?:number;
    fromChannel?:string;
    fromAppId?:string;
    fromUser?:string;
    create_time?:number;
    update_time?:number;
}

/*** sequelize define 之后操作的对象 的类型定义 */
export interface sys_user_table extends Instance<sys_user_attrs>,sys_user_attrs {}

export var column:sequelize.DefineAttributes = {
    id: { type: sequelize.INTEGER(11), primaryKey: true, allowNull: true },
    user_id: { type: sequelize.STRING(64), allowNull: false },
    open_id: { type: sequelize.INTEGER(11), allowNull: false },
    game_id: { type: sequelize.INTEGER(11), allowNull: false },
    plat_id: { type: sequelize.INTEGER(11), allowNull: false },
    avatar: { type: sequelize.STRING(300) },
    nickname: { type: sequelize.STRING(60) },
    money: { type: sequelize.DECIMAL(10), defaultValue: 0 },
    totalPay: { type: sequelize.DECIMAL(10), defaultValue: 0 },
    fromChannel: { type: sequelize.STRING(255) },
    fromAppId: { type: sequelize.STRING(255) },
    fromUser: { type: sequelize.STRING(255) },
    create_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("create_time")).getTime();
    }},
    update_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("update_time")).getTime();
    }},
}

export var opts:sequelize.DefineOptions<sys_user_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;