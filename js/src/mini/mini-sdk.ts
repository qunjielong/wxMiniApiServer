import {wxApis} from "../common/wxApis";
import Socket from "../common/Socket";

declare const wx: any

const socket = new Socket("mini");
socket.connect()

wxApis.forEach((api: string) => {
    socket.on(`wx.${api}`, async (param: any) => {
        return new Promise((resolve, reject) => {
            let isReturned = false
            console.log("data....", param)
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
            if (ret !== undefined) {
                isReturned = true
                resolve(ret)
            }
        })
    })
});
