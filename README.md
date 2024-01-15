JWT - @mhio/jwt
----------

Do JWT things for koa

## Install

```
yarn add @mhio/jwt
npm install @mhio/jwt
```

## Usage

[API Docs](doc/API.md)

```
import { Jwt } from '@mhio/jwt'

const jwt = new Jwt({ jwt_sign_secret: 'SomeStrongPasswordForJwt' })
```

Auto generated private/public key
```
import { Jwt } from '@mhio/jwt'
import Koa from 'koa'
import Router from '@koa/router'

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


```

## Links

https://github.com/mhio/node-jwt

https://www.npmjs.com/package/@mhio/jwt

