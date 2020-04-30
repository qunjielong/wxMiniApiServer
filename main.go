package main

import (
	"github.com/gin-gonic/gin"
	gw "go-web-utilities"
	"log"
	"time"
)

func main() {
	log.Println("Hello World")
	app := gin.Default()
	makeApi(app.Group("/api"))
	err := app.Run(":8080")
	if err != nil {
		log.Println(err)
	}
}

var tunnels = map[string]*Tunnel{}

func makeApi(api *gin.RouterGroup) {
	api.POST("/apply_token", gw.Rest(func(c *gw.Context) {
		tunnel := NewTunnel(time.Second * 5)
		tunnels[tunnel.ID] = tunnel
		c.OK(tunnel.ID)
	}))

	tunnelApi := api.Group("/tunnels")

	/** 设置缓存 */
	tunnelApi.POST("/:tid/set_cache", gw.Rest(func(c *gw.Context) {
		// TODO:
	}))

	/** 获取缓存 */
	tunnelApi.POST("/:tid/get_cache", gw.Rest(func(c *gw.Context) {
		// TODO:
	}))

	/** 小程序发送给 H5 */
	tunnelApi.POST("/:tid/to-h5", gw.Rest(func(c *gw.Context) {
		// TODO:
	}))

	/** H5 送给小程序 */
	tunnelApi.POST("/:tid/to-mini-app", gw.Rest(func(c *gw.Context) {
		// TODO:
	}))

	/** 长轮训 */
	tunnelApi.POST("/:tid/long-pull/:clientType", gw.Rest(func(c *gw.Context) {

	}))

	/** 小程序心跳控制 */
	tunnelApi.POST("/:tid/heart-beat", gw.Rest(func(c *gw.Context) {

	}))
}
