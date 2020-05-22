import {wxApis} from "../common/wxApis"
import Socket from "../common/Socket";

window.addEventListener("load", () => {
    const socket = new Socket("h5");
    const global = window as any;
    const wxApisObj: any = {};
    wxApis.forEach((wxName: string) => {
        wxApisObj[wxName] = (param: any) => {
            console.log("calling...", wxName)
            socket.emit(`wx.${wxName}`, param, (data) => {
                if (param.success) {
                    param.success(data)
                }
            })
        }
    });
    global.wx = Object.assign(global.wx || {}, wxApisObj)
    socket.connect()
});
