/* global expect */

const koa = require('koa')
const supertest = require('supertest')
const { Jwt } = require('../../')

const {
  RE_JWT_TOKEN,
} = require('../fixture/regex')

describe('int::jwt::Jwt', function(){

  describe('static', function(){
  })

  describe('instance', function(){

    let jwt

    beforeEach(function(){
      jwt = new Jwt({ jwt_sign_secret: 'testing' })
    })

    it('should work as koa middleware', async function(){
      const app = new koa()
      app.use(async function(ctx, next){
        if (ctx.path === '/jwt') {
          const signed = await jwt.sign({ bool: true })
          ctx.body = signed // eslint-disable-line require-atomic-updates
          ctx.status = 200 // eslint-disable-line require-atomic-updates
        }
        else {
          await next()
        }
      })
      app.use(jwt.koaMiddleware())
      app.use(async function (ctx) {
        if (ctx.path === '/protected') {
          ctx.body = 'ok'
          ctx.status = 200
        }
      })
      const request = supertest(app.callback())
      const res = await request.get('/jwt')
      const token = res.text
      // expect(res).to.eql({})
      expect(token).to.match(RE_JWT_TOKEN)
      const test = await request.get('/protected').set('Authorization', `Bearer ${token}`)
      expect(test.text).to.equal('ok')
      
    })

  })

})
