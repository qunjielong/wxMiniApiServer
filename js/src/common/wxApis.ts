export const wxApis = [
    "showLoading",
    "hideLoading",
    "getStorage",
    "setStorage",
    "removeStorage",
    "showModal",
    "showToast",
]

export const wxApiHost = "http://localhost:8080"

export interface IResponse {
    data: any,
    msg: string,
}
