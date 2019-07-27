import { CacheMgr } from "./CacheMgr";
import { PlatMgr } from "./PlatMgr";

export function managerInit():void {
    cacheMgr = new CacheMgr();
    platMgr = new PlatMgr();
}

export var cacheMgr:CacheMgr;
export var platMgr:PlatMgr;