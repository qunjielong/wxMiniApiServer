import {wxApis} from "../common/wxApis"
import Socket from "../common/Socket";

const extractDataMethods = (data: any): { data: any, methodIds: string[], methods: any } => {
    const obj: any = {}
    const methodIds: string[] = []
    const methods: any = {}
    Object.keys(data).forEach((key) => {
        const v = data[key]
        if (typeof v === "function") {
            methodIds.push(key)
            methods[key] = v
        } else {
            obj[key] = v
        }
    })
    return { data: obj, methodIds, methods }
}

window.addEventListener("load", () => {
    const socket = new Socket("h5");
    const global = window as any
    const wxApisObj: any = {}
    const callbacks: any = {}
    wxApis.forEach((wxName: string) => {
        wxApisObj[wxName] = (param: any) => {
            console.log("calling...", wxName, param)
            const { data, methods, methodIds } = extractDataMethods(param)
            console.log(data, methods, methodIds)
            const eventId = socket.emit(`wx.${wxName}`, { data, methodIds }, (data) => {
                if (param.success) {
                    param.success(data)
                }
            })
            callbacks[eventId] = methods
        }
    });

    socket.on("api-cb", function ({ eventId, methodId, data }) {
        const method = callbacks?.[eventId]?.[methodId]
        if (!method) {
            console.warn("API 回调函数未找到: ", eventId, methodId)
        } else {
            method(data)
            delete callbacks[eventId][methodId]
            if (Object.keys(callbacks[eventId]).length === 0) {
                delete callbacks[eventId]
            }
        }
    })

    global.wx = Object.assign(global.wx || {}, wxApisObj)
    socket.connect()
});
