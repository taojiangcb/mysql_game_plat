import { platRedis } from "../redis_clients/PlatRedis";
import { REDIS_KEY } from "../config/Define";


async function validateLoginToken(userId:string,token:string) {
    let usr_token = await platRedis.redis_client.getString(REDIS_KEY.REDIS_TOKEN + userId);
    return usr_token === token;
}

export var userController = {
    validateLoginToken:validateLoginToken
}