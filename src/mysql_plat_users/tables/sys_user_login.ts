import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_user_login;

export interface sys_user_login_attrs {
    user_id?:string;
    login_time?:number;
}

/*** sequelize define 之后操作的对象 的类型定义 */
export interface sys_user_login_table extends Instance<sys_user_login_attrs>,sys_user_login_attrs {}

export var column:sequelize.DefineAttributes = {
    user_id: { type: sequelize.STRING(64), primaryKey: true,allowNull: false },
    login_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("update_time")).getTime();
    }},
}

export var opts:sequelize.DefineOptions<sys_user_login_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;