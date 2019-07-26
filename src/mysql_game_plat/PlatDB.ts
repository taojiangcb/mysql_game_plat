import { MySqlClient } from "../database/mysqlDao/MySqlClient";

import { TABLE_NAME } from "../mysql_define/MySqlDefine";
import { ISysPlatConfigDAO, ISysPlatConfigDAOAtt } from "./tables/sys_plat_config";
import { ISysPlatGameDAO, ISysPlatGameDAOATT } from "./tables/sys_plat_game";
import { ISysPromotion, ISysPromotionAttr } from "./tables/sys_promotion";
import { iSys_ios_app_attrs, iSys_ios_app_table } from "./tables/sys_ios_app";
import { iSys_plat_log_table, iSys_plat_log_atts } from "./tables/sys_plat_log";
import { sys_admin_table, sys_admin_attr } from "./tables/sys_admins";
import { sys_user_table,sys_user_attrs} from "../mysql_plat_users/tables/sys_user";
import { SysTool } from "../util/tools";
import { config } from "../../app";


class PlatDB {
    constructor(){}
    mysql_client:MySqlClient;
    private iosApp:iSys_ios_app_attrs[] = null;

    get sysPlatServerConfigDAO(){
        if(this.mysql_client){
            return this.mysql_client.getTable<ISysPlatConfigDAO,ISysPlatConfigDAOAtt>(TABLE_NAME.sys_plat_config);
        }
        return null;
    }

    get sysPlatGameDAO() {
        if(this.mysql_client) {
            return this.mysql_client.getTable<ISysPlatGameDAO,ISysPlatGameDAOATT>(TABLE_NAME.sys_plat_game);
        }
        return null;
    }

    get sysPromotion() {
        if(this.mysql_client) {
            return this.mysql_client.getTable<ISysPromotion,ISysPromotionAttr>(TABLE_NAME.sys_promotion);
        }
        return null;
    }

    get sysIosAppDao() {
        if(this.mysql_client) {
            let tableModel = this.mysql_client.getTable<iSys_ios_app_table,iSys_ios_app_attrs>(TABLE_NAME.sys_ios_app);
            return tableModel;
            //return this.mysql_client.getTable<iSys_ios_app_table,iSys_ios_app_attrs>(TABLE_NAME.sys_ios_app);
        }
        return null;
    }

    get sysPlatLogDAO() {
        if(this.mysql_client) {
            return this.mysql_client.getTable<iSys_plat_log_table,iSys_plat_log_atts>(TABLE_NAME.sys_plat_log);
        }
        return null;
    }

    get sysAdminDAO() {
        if(this.mysql_client) {
            return this.mysql_client.getTable<sys_admin_table,sys_admin_attr>(TABLE_NAME.sys_admins);
        }
        return null;
    }

    sysUserDAO(id?:string) {
        if(this.mysql_client) {
            var user_model = this.mysql_client.getTable<sys_user_table,sys_user_attrs>(TABLE_NAME.sys_user);
            var table_name = id ? SysTool.getTableName(id,TABLE_NAME.sys_user,config.my_sql_plat_oa.tables.sys_user) : TABLE_NAME.sys_user;
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

    async getIosAppCache():Promise<iSys_ios_app_attrs[]> {
        if(this.iosApp) return this.iosApp;
        if(this.sysIosAppDao) {
            let iosAppDatas = await this.sysIosAppDao.findAll();
            if(iosAppDatas.length > 0) {
                this.iosApp = [];
                iosAppDatas.forEach(element => {
                    this.iosApp.push(element);
                });
            }
        }
        return this.iosApp;
    }
}

export var platDB = new PlatDB();