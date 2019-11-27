<a name="Jwt"></a>

## Jwt
**Kind**: global class  

* [Jwt](#Jwt)
    * [new Jwt(options)](#new_Jwt_new)
    * _instance_
        * [.init()](#Jwt+init) ⇒ <code>Promise.&lt;undefined&gt;</code>
        * [.setJwtVerifyDefaultOption(name, value)](#Jwt+setJwtVerifyDefaultOption)
        * [.setJwtSignDefaultOption(name, value)](#Jwt+setJwtSignDefaultOption)
        * [.sign(data, options)](#Jwt+sign)
        * [.verify(token, options)](#Jwt+verify)
        * [.koaVerifyJwtMiddleware(ctx, next)](#Jwt+koaVerifyJwtMiddleware)
        * [.koaMiddleware()](#Jwt+koaMiddleware) ⇒ <code>function</code>
        * [.rotateRsaKeyPair()](#Jwt+rotateRsaKeyPair) ⇒ <code>array.&lt;{public\_key: String, private\_key: String}&gt;</code>
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

### jwt.sign(data, options)
<p>Promise to create a JWT for some data</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | <p>Date to be encoded in token</p> |
| options | <code>\*</code> | <p>jsonwebtoken options override for this call</p> |


* * *

<a name="Jwt+verify"></a>

### jwt.verify(token, options)
<p>Promise to decode a signed JWT token</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | <p>JWT Token string</p> |
| options | <code>\*</code> | <p>jsonwebtoken options override for this call</p> |


* * *

<a name="Jwt+koaVerifyJwtMiddleware"></a>

### jwt.koaVerifyJwtMiddleware(ctx, next)
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
<p>Creates a new ephemeral JWT key pair.
Maybe store the old one's for a bit so people don't get booted.</p>

**Kind**: instance method of [<code>Jwt</code>](#Jwt)  
**Returns**: <code>array.&lt;{public\_key: String, private\_key: String}&gt;</code> - <p>Array of private and public RSA key</p>  

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

