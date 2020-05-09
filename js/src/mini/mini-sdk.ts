import {wxApis} from "../common/wxApis";
import MiniSocket from "./MiniSocket";

declare const wx: any

const socket = new MiniSocket();

wxApis.forEach((api: string) => {
    socket.on(`wx.${api}`, async (param: any) => {
        return new Promise((resolve, reject) => {
            let isReturned = false
            const ret = wx[api]({
                ...param,
                success: (data: any) => {
                    if (isReturned) { return }
                    resolve(data)
                },
                error: (err: any) => {
                    if (isReturned) { return }
                    resolve(err)
                },
            });
            if (ret) {
                isReturned = true
                resolve(ret)
            }
        })
    })
});
