package main

import (

"github.com/gin-gonic/gin"
	gw "go-web-utilities"
	"log"
	"time"
)

func main() {
	app := gin.Default()
	trackDyingTunnels()
	makeApi(app.Group("/api"))
	err := app.Run(":8080")
	if err != nil {
		log.Println(err)
	}
}

func initk()  {
	for i := 0; i < 10000; i++ {
		s := make(chan interface{})
		go func() {
			log.Println("Ready to send ---->")
			s <- 1
		}()
		select {
		case st := <- s:
			log.Println("OJBK", st)
		}
	}
}

func trackDyingTunnels() {
	time.AfterFunc(5 * time.Second, func() {
		for k, t := range tunnels {
			if t.IsDead {
				log.Println("Dead -> ", t)
				delete(tunnels, k)
			}
		}
		trackDyingTunnels()
	})
}

var tunnels = map[string]*Tunnel{}

type TunnelParamHandler func(c *gw.Context, t *Tunnel)

func wrapTunnel(handler TunnelParamHandler) gin.HandlerFunc {
	return gw.Rest(func(c *gw.Context) {
		tid := c.C.Param("tid")
		if t, ok := tunnels[tid]; ok {
			handler(c, t)
		} else {
			c.BadRequest("通信通道不存在或者已经销毁")
		}
	})
}

func makeApi(api *gin.RouterGroup) {
	api.POST("/apply-token", gw.Rest(func(c *gw.Context) {
		tunnel := NewTunnel(time.Second * 5)
		tunnels[tunnel.ID] = tunnel
		c.OK(tunnel.ID)
	}))

	tunnelApi := api.Group("/tunnels")

	/** 设置缓存 */
	tunnelApi.POST("/:tid/set-cache/:key", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		key := c.C.Param("key")
		var data interface{}
		err := c.BindJSON(&data)
		if err != nil {
			c.BadRequest(err.Error())
			return
		}
		t.SetCache(key, data)
	}))

	/** 获取缓存 */
	tunnelApi.POST("/:tid/get-cache", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		key := c.C.Param("key")
		value := t.GetCache(key)
		c.OK(value)
	}))

	/** 小程序发送给 H5 */
	tunnelApi.POST("/:tid/to-h5", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		var data interface{}
		err := c.BindJSON(&data)
		if err != nil {
			c.BadRequest(err.Error())
			return
		}
		t.SendToClient(data)
	}))

	/** H5 送给小程序 */
	tunnelApi.POST("/:tid/to-mini", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		var data interface{}
		err := c.BindJSON(&data)
		if err != nil {
			c.BadRequest(err.Error())
			return
		}
		t.SendToHost(data)
	}))

	/** 长轮训 */
	tunnelApi.POST("/:tid/long-pull/:clientType", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		clientType := c.C.Param("clientType")

		s := make(chan interface{})

		time.AfterFunc(10 * time.Second, func() {
			if !c.C.Writer.Written() {
				s <- []string{}
			}
		})

		if clientType == "mini" {
			go t.SetHostChan(s)
		} else if clientType == "h5" {
			go t.SetClientChan(s)
		} else {
			c.BadRequest("不存在的长轮训类型 " + clientType)
			return
		}

		if !c.C.Writer.Written() {
			select {
			case st := <-s:
				if !c.C.Writer.Written() {
					log.Println("Sending....", st)
					c.OK(st)
				} else {
					log.Println("Header is written.")
				}
			}
		}
	}))

	/** 小程序心跳控制 */
	tunnelApi.POST("/:tid/heart-beat", wrapTunnel(func(c *gw.Context, t *Tunnel) {
		t.Beat()
	}))
}

