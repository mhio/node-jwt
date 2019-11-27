
// import { Jwt } from '@mhio/jwt'
// import Koa from 'koa'
// import Router from '@koa/router'
// const { Jwt } = require('@mhio/jwt')
const { Jwt } = require('../')
const Koa = require('koa')
const Router = require('@koa/router')

const jwt = new Jwt({ jwt_algorithm: 'RS256' })
const app = new Koa()
const router = new Router()

router.get('/jwt', async function(ctx) {
  const token = await jwt.jwtSign({ role: 'admin' })
  ctx.body = token
})
router.use(jwt.koaMiddleware())
router.get('/protected', async function(ctx) {
  ctx.body = ok
})

app.use(router.routes())
 .use(router.allowedMethods())


