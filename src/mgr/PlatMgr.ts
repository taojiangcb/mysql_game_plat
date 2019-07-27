import { PlatIds } from "../config/Define";
import { define } from "mime";
import { PlatBaseSvr } from "../plat/PlatBaseSvr";
import { PlatDevSvr } from "../plat/PlatDevSvr";
import { PlatWxSvr } from "../plat/PlatWxSvr";


export class PlatMgr {
    constructor(){}

    getPlatInstance(platId:number):PlatBaseSvr {
        switch(platId) {
            case PlatIds.WX:
                return new PlatWxSvr();
            default:
                return new PlatDevSvr();
        }
    }
}