import { CacheMgr } from "./CacheMgr";

export function managerInit():void {
    cacheMgr = new CacheMgr();
}

export var cacheMgr:CacheMgr;