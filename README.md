# wxMiniApiServer
WebView 通过中转服务器调用小程序的接口 wx.XXX

```
[GIN-debug] POST   /api/apply-token          --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/set-cache/:key --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/get-cache --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/to-h5   --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/to-mini-app --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/long-pull/:clientType --> go-web-utilities.Rest.func1 (3 handlers)
[GIN-debug] POST   /api/tunnels/:tid/heart-beat --> go-web-utilities.Rest.func1 (3 handlers)
```
