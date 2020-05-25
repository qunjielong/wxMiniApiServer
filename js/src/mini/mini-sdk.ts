import {wxApis} from "../common/wxApis";
import Socket from "../common/Socket";

declare const wx: any

const socket = new Socket("mini");
socket.connect()

wxApis.forEach((api: string) => {
    socket.on(`wx.${api}`, async (param: any, eventId?: string) => {
        return new Promise((resolve, reject) => {
            let isReturned = false
            console.log("data....", param)
            const { data, methodIds } = param
            const ret = wx[api]({
                ...data,
                ...methodIds.reduce((ret: any, methodId: string) => {
                    ret[methodId] = (data: any) => {
                        socket.emit("api-cb", { eventId, methodId, data })
                    }
                    return ret
                }, {})
            });
            resolve(ret)
        })
    })
});
