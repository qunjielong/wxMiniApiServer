package main

import (
	"github.com/gofrs/uuid"
	gw "go-web-utilities"
	"time"
)

type Tunnel struct {
	*gw.Heartbeat
	ID string
	cache map[string]interface{}
	toHostMessages *[]interface{}
	toClientMessages *[]interface{}
	toHostCtx *gw.Context
	toClientCtx *gw.Context
}

func NewTunnel(msToDie time.Duration) *Tunnel {
	id, _ := uuid.NewV4()
	return &Tunnel{
		gw.NewHeartbeat(msToDie),
		id.String(),
		map[string]interface{}{},
		&[]interface{}{},
		&[]interface{}{},
		nil,
		nil,
	}
}

func (tu *Tunnel) SetCache (key string, value interface{}) {
	tu.cache[key] = value
}

func (tu *Tunnel) GetCache (key string) interface{}  {
	if value, ok := tu.cache[key]; ok {
		return value
	} else {
		return nil
	}
}

func (tu *Tunnel) SetHostCtx(ctx *gw.Context)  {
	tu.toHostCtx = ctx
}

func (tu *Tunnel) SetClientCtx(ctx *gw.Context)  {
	tu.toClientCtx = ctx
}

func (tu *Tunnel) SendToClient(data interface{})  {
	sendMessageTo(tu.toClientCtx, tu.toClientMessages, data)
	tu.toClientCtx = nil
}

func (tu *Tunnel) SendToHost(data interface{})  {
	sendMessageTo(tu.toHostCtx, tu.toHostMessages, data)
	tu.toHostCtx = nil
}

func sendMessageTo(ctx *gw.Context, msgs *[]interface{}, data interface{})  {
	*msgs = append(*msgs, data)
	if ctx != nil {
		ctx.OK(msgs)
	}
}
