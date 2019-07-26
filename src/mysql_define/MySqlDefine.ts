import { Options } from "sequelize";
import { config } from "../../app";


export const TABLE_NAME = {
    sys_user:"sys_user",
    sys_admins:"sys_admins",
    sys_plat_config:"sys_plat_config",
    sys_promotion:"sys_promotion",
    sys_ios_app:"sys_ios_app",
    sys_plat_game:"sys_plat_game",
    sys_plat_log:"sys_plat_log",
}

export var game_plat_oa_define = {
    opts:()=>{
        let opts: Options = {
            host: config.my_sql_plat_oa.host,
            port: config.my_sql_plat_oa.port,
            dialect: "mysql",
            username: config.my_sql_plat_oa.user,
            password: config.my_sql_plat_oa.password,
            database: config.my_sql_plat_oa.database,
            typeValidation:false
        };
        return opts
    },
}

export var game_plat_users_define = {
    opts:()=>{
        let opts: Options = {
            host: config.my_sql_plat_users.host,
            port: config.my_sql_plat_users.port,
            dialect: "mysql",
            username: config.my_sql_plat_users.user,
            password: config.my_sql_plat_users.password,
            database: config.my_sql_plat_users.database,
            typeValidation:false
        };
        return opts
    }
}