<a name="Jwt"></a>

## Jwt
**Kind**: global class  

* [Jwt](#Jwt)
    * [new Jwt(options)](#new_Jwt_new)
    * _instance_
        * [.init()](#Jwt+init) ⇒ <code>Promise.&lt;undefined&gt;</code>
        * [.setJwtVerifyDefaultOption(name, value)](#Jwt+setJwtVerifyDefaultOption)
        * [.setJwtSignDefaultOption(name, value)](#Jwt+setJwtSignDefaultOption)
        * [.sign(data, options)](#Jwt+sign) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.verify(token, options)](#Jwt+verify) ⇒ <code>Promise.&lt;object&gt;</code>
        * [.koaVerifyJwtMiddleware(ctx, next)](#Jwt+koaVerifyJwtMiddleware) ⇒ <code>undefined</code>
        * [.koaMiddleware()](#Jwt+koaMiddleware) ⇒ <code>function</code>
        * [.rotateRsaKeyPair()](#Jwt+rotateRsaKeyPair) ⇒ <code>array.&lt;{public\_key: String, private\_key: String}&gt;</code>
        * [.koaVerifyJwtCookieMiddleware(ctx, next)](#Jwt+koaVerifyJwtCookieMiddleware) ⇒ <code>undefined</code>
        * [.koaCookieMiddleware()](#Jwt+koaCookieMiddleware) ⇒ <code>function</code>
        * [.getJwtTokenFromKoaContextCookie(context)](#Jwt+getJwtTokenFromKoaContextCookie) ⇒ <code>string</code>
    * _static_
        * [.getJwtTokenFromKoaContext(context)](#Jwt.getJwtTokenFromKoaContext) ⇒ <code>string</code>
        * [.generateRsaKeyPair()](#Jwt.generateRsaKeyPair) ⇒ <code>Promise.&lt;array&gt;</code>


* * *

<a name="new_Jwt_new"></a>

### new Jwt(options)
<p>Instance</p>


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | <p>Options object</p> |
| options.jwt_algorithm | <code>string</code> | <p><code>jsonwebtoken</code> algorithm (HS256)</p> |
| options.jwt_sign_secret | <code>string</code> | <p>JWT signing string</p> |
| options.jwt_private_key | <code>string</code> | <p>JWT RS Private key string</p> |
| options.jwt_public_key | <code>string</code> | <p>JWT RS Public ket string</p> |
| options.jwt_private_key_path | <code>string</code> | <p>JWT RS Full path to private key</p> |
| options.jwt_public_key_path | <code>string</code> | <p>JWT RS Full path to public key</p> |
| options.koa_cookie | <code>string</code> | <p>Name of Koa cookie to use, instead of Auth header</p> |


* * *

<a name="Jwt+init"></a>

### jwt.init() ⇒ <code>Promise.&lt;undefined&gt;</code>
<p>Called when any of the properties change</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

* * *

<a name="Jwt+setJwtVerifyDefaultOption"></a>

### jwt.setJwtVerifyDefaultOption(name, value)
<p>Set a defailt options for the nodewebtoken <code>.verify</code> call
https://github.com/auth0/node-jsonwebtoken</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Option key name</p> |
| value | <code>\*</code> | <p>Option value</p> |


* * *

<a name="Jwt+setJwtSignDefaultOption"></a>

### jwt.setJwtSignDefaultOption(name, value)
<p>Set a defailt options for the nodewebtoken <code>.sign</code> call
https://github.com/auth0/node-jsonwebtoken</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Option key name</p> |
| value | <code>\*</code> | <p>Option value</p> |


* * *

<a name="Jwt+sign"></a>

### jwt.sign(data, options) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Promise to create a JWT for some data</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>JWT signed string</p>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | <p>Date to be encoded in token</p> |
| options | <code>\*</code> | <p>jsonwebtoken options override for this call</p> |


* * *

<a name="Jwt+verify"></a>

### jwt.verify(token, options) ⇒ <code>Promise.&lt;object&gt;</code>
<p>Promise to decode a signed JWT token</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>Promise.&lt;object&gt;</code> - <p>Resolves the token data object</p>  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | <p>JWT Token string</p> |
| options | <code>\*</code> | <p>jsonwebtoken options override for this call</p> |


* * *

<a name="Jwt+koaVerifyJwtMiddleware"></a>

### jwt.koaVerifyJwtMiddleware(ctx, next) ⇒ <code>undefined</code>
<p>This is middleware for use in Koa
The verified/decoded token data is stored in <code>context.state.token</code>
The original token string is in <code>context.state.token_string</code>
The function needs to be bound to <code>Jwt</code> class instance.</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>object</code> | <p>Koa context object</p> |
| next | <code>function</code> | <p>Koa <code>next</code> promise</p> |

**Example**  
```js
app.use(jwtinstance.koaVerifyJwtMiddleware.bind(jwtinstance))
```

* * *

<a name="Jwt+koaMiddleware"></a>

### jwt.koaMiddleware() ⇒ <code>function</code>
<p>Returns an instance bound middleware function. See <code>.koaVerifyJwtMiddleware</code></p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>function</code> - <p>Koa middleware function to verify JWT header, bound to this instance</p>  
**Example**  
```js
app.use(jwtinstance.koaMiddleware())
```

* * *

<a name="Jwt+rotateRsaKeyPair"></a>

### jwt.rotateRsaKeyPair() ⇒ <code>array.&lt;{public\_key: String, private\_key: String}&gt;</code>
<p>Creates a new JWT key pair, can auto generate, use params or read from file.
Maybe store the old one's for a bit so people don't get booted.</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>array.&lt;{public\_key: String, private\_key: String}&gt;</code> - <p>Array of private and public RSA key</p>  
**Params**: <code>object</code> options                     - Options object  
**Params**: <code>boolean</code> options.discard            - Discard old keys  
**Params**: <code>string</code> options.public_key          - New public key  
**Params**: <code>string</code> options.private_key         - New private key  

* * *

<a name="Jwt+koaVerifyJwtCookieMiddleware"></a>

### jwt.koaVerifyJwtCookieMiddleware(ctx, next) ⇒ <code>undefined</code>
<p>This is middleware for use in Koa
The verified/decoded token data is stored in <code>context.state.token</code>
The original token string is in <code>context.state.token_string</code>
The function needs to be bound to <code>Jwt</code> class instance.</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>object</code> | <p>Koa context object</p> |
| next | <code>function</code> | <p>Koa <code>next</code> promise</p> |

**Example**  
```js
app.use(jwtinstance.koaVerifyJwtCookieMiddleware.bind(jwtinstance))
```

* * *

<a name="Jwt+koaCookieMiddleware"></a>

### jwt.koaCookieMiddleware() ⇒ <code>function</code>
<p>Returns an instance bound middleware function. See <code>.koaVerifyJwtCookieMiddleware</code></p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>function</code> - <p>Koa middleware function to verify JWT header, bound to this instance</p>  
**Example**  
```js
app.use(jwtinstance.koaCookieMiddleware())
```

* * *

<a name="Jwt+getJwtTokenFromKoaContextCookie"></a>

### jwt.getJwtTokenFromKoaContextCookie(context) ⇒ <code>string</code>
<p>Get a JWT token from Koa headers</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>string</code> - <ul>
<li>Parsed token</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | <p>Koa context object</p> |


* * *

<a name="Jwt.getJwtTokenFromKoaContext"></a>

### Jwt.getJwtTokenFromKoaContext(context) ⇒ <code>string</code>
<p>Get a JWT token from Koa headers</p>

**Kind**: static method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>string</code> - <ul>
<li>Parsed token</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | <p>Koa context object</p> |


* * *

<a name="Jwt.generateRsaKeyPair"></a>

### Jwt.generateRsaKeyPair() ⇒ <code>Promise.&lt;array&gt;</code>
<p>Helper to generate a new RSA key pair for JWT</p>

**Kind**: static method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>Promise.&lt;array&gt;</code> - <p>A promise for an array of [public_key, private_key]</p>  

* * *

