import { MySqlClient } from "../database/mysqlDao/MySqlClient";
import { sys_user_table,sys_user_attrs} from "./tables/sys_user";
import { SysTool } from "../util/tools";
import { config } from "../../app";
import { TABLE_NAME } from "../mysql_define/MySqlDefine";
import { sys_user_login_table, sys_user_login_attrs } from "./tables/sys_user_login";
import { sys_order_table, sys_order_attrs } from "./tables/sys_order";


class PlatUsersDB {
    constructor(){}
    mysql_client:MySqlClient;
    
    /** 用户数据表 */
    sys_user_dao(id?:string) {
        return this.mysql_client 
            ? this.mysql_client.get_table_model<sys_user_table,sys_user_attrs>(id,TABLE_NAME.sys_user,config.my_sql_plat_oa.tables.sys_user)
            : null;
    }

    /** 日志数据表 */
    sys_user_log_dao(id?:string) {
        return this.mysql_client 
            ? this.mysql_client.get_table_model<sys_user_login_table,sys_user_login_attrs>(id,TABLE_NAME.sys_user_login,config.my_sql_plat_oa.tables.sys_user_login)
            : null;

    }

    /** 订单数据表 */
    sys_order_dao(id?:string) {
        return this.mysql_client 
            ? this.mysql_client.get_table_model<sys_order_table,sys_order_attrs>(id,TABLE_NAME.sys_order,config.my_sql_plat_users.tables.sys_order)
            : null;
    }

    get dbClient() {
        if(this.mysql_client) { return this.mysql_client.sequelizeClient; }
    }
}

export var platUsersDB = new PlatUsersDB();