import {wxApis} from "../common/wxApis";
import Socket from "../common/Socket";

declare const wx: any

const socket = new Socket("mini");
socket.connect()

wxApis.forEach((api: string) => {
    socket.on(`wx.${api}`, async (param: any, eventId?: string) => {
        return new Promise((resolve, reject) => {
            console.log("data....", param.data)
            if (!Array.isArray(param.data)) {
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
            } else {
                console.log("Receive array params", param)
                const ret = wx[api](...(param.data || []))
                resolve(ret)
            }
        })
    })
});
