import { MySqlClient } from "../database/mysqlDao/MySqlClient";
import { sys_user_table,sys_user_attrs} from "./tables/sys_user";
import { SysTool } from "../util/tools";
import { config } from "../../app";
import { TABLE_NAME } from "../mysql_define/MySqlDefine";
import { sys_user_login_table, sys_user_login_attrs } from "./tables/sys_user_login";


class PlatUsersDB {
    constructor(){}
    mysql_client:MySqlClient;
    
    sys_user_dao(id?:string) {
        if(this.mysql_client) {
            var user_model = this.mysql_client.getTable<sys_user_table,sys_user_attrs>(TABLE_NAME.sys_user);
            var table_name = id ? SysTool.getTableName(id,TABLE_NAME.sys_user,config.my_sql_plat_oa.tables.sys_user) : TABLE_NAME.sys_user;
            user_model['tableName']= table_name;
            return user_model;
        }
        return null;
    }

    sys_user_log_dao(id?:string) {
        if(this.mysql_client) {
            var user_model = this.mysql_client.getTable<sys_user_login_table,sys_user_login_attrs>(TABLE_NAME.sys_user_login);
            var table_name = id ? SysTool.getTableName(id,TABLE_NAME.sys_user_login,config.my_sql_plat_oa.tables.sys_user_login) : TABLE_NAME.sys_user;
            user_model['tableName']= table_name;
            return user_model;
        }
        return null;
    }

    get dbClient() {
        if(this.mysql_client) {
            return this.mysql_client.sequelizeClient;
        }
    }
}

export var platUsersDB = new PlatUsersDB();