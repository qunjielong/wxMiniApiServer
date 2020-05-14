import {wxApis} from "../common/wxApis"
import Socket from "../common/Socket";

document.addEventListener("ready", () => {
    const socket = new Socket("h5");
    const global = window as any;
    const wxApisObj: any = {};
    wxApis.forEach((wxName: string) => {
        wxApisObj[wxName] = (param: any) => {
            socket.emit(`wx.${wxName}`, param, (data) => {
                if (param.success) {
                    param.success(data)
                }
            })
        }
    });
    global.wx = Object.assign(global.wx || {}, wxApisObj)
});
