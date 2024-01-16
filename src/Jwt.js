import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { readFile as fsReadFile } from 'node:fs/promises'
import jwt from 'jsonwebtoken'
import { Exception, WebException } from '@mhio/exception'
import debugr from 'debug'

export { Exception, WebException } from '@mhio/exception'

const debug = (debugr('mh:jwt:Jwt').enabled)
  ? debugr('mh:jwt:Jwt')
  : function noop() { }

let environment_var_name = 'JWT_SECRET'

export class Jwt {
  
  static get environment_var_name(){
    return environment_var_name
  }

  /**
   * Get a JWT token from Koa headers
   * 
   * @param {object} context - Koa context object
   * @returns {string} - Parsed token
   */
  static getJwtTokenFromKoaContext(context) {
    if (!context) {
      throw new WebException('No context', { status: 400 })
    }
    if (!context.header) {
      throw new WebException('No headers in context', { status: 400 })
    }
    if (!context.header.authorization) {
      throw new WebException('Authentication Error', { status: 403, code: 'authorization_header_missing' })
    }
    debug('context.header.authorization', context.header.authorization)
    const header_parse = /^Bearer (.+)$/.exec(context.header.authorization)
    if (!header_parse) {
      throw new WebException('Authentication Error', { status: 403, code: 'authorization_header_parse' })
    }
    // return just the matched token
    return header_parse[1]
  }

  /**
   * Helper to generate a new RSA key pair for JWT
   * @return {Promise<array>} A promise for an array of [public_key, private_key]
   */
  static async generateRsaKeyPair() {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: 3072,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, public_key, private_key) => {
        if (err) return reject(err)
        try {
          const signer = crypto.createSign('RSA-SHA256')
          signer.update('validation_string')
          const signature = signer.sign({
            key: private_key,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING
          }, 'base64')

          const verifier = crypto.createVerify('RSA-SHA256')
          verifier.update('validation_string')
          const verified = verifier.verify({
            key: public_key,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING
          }, signature, 'base64')

          if (!verified) reject(new Exception('Failed to validate generated key pair'))

          resolve([public_key, private_key])
        }
        catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * Instance
   * @param { object } options                        - Options object
   * @param { string } options.jwt_algorithm          - `jsonwebtoken` algorithm (HS256)
   * @param { string } options.jwt_sign_secret        - JWT signing string
   * @param { string } options.jwt_private_key        - JWT RS Private key string
   * @param { string } options.jwt_public_key         - JWT RS Public ket string
   * @param { string } options.jwt_private_key_path   - JWT RS Full path to private key
   * @param { string } options.jwt_public_key_path    - JWT RS Full path to public key
   * @param { string } options.koa_cookie             - Name of Koa cookie to use, instead of Auth header
   */
  constructor(options) {
    // Simple key is the default
    this.jwt_algorithm = 'HS256'

    if (options) {
      if (options.jwt_algorithm) this.jwt_algorithm = options.jwt_algorithm
      if (options.jwt_sign_secret) {
        this.jwt_sign_secret = options.jwt_sign_secret
        this.jwt_verify_secret = options.jwt_sign_secret
      }
      if (options.jwt_private_key) this.jwt_sign_secret = options.jwt_private_key
      if (options.jwt_public_key) {
        this.jwt_verify_secret = options.jwt_public_key
        this.jwt_public_key = this.jwt_verify_secret
      }
      if (options.jwt_private_key_path) {
        this.jwt_private_key_path = options.jwt_private_key_path
      }
      if (options.jwt_public_key_path) {
        this.jwt_public_key_path = options.jwt_public_key_path
      }

      if (options.koa_cookie) this.koa_cookie = options.koa_cookie
    }

    this.init()
    this.getJwtTokenFromKoaContext = this.constructor.getJwtTokenFromKoaContext.bind(this.constructor)
  }

  /**
   * @description Called when any of the properties change
   * @returns {Promise<undefined>} 
   */
  init() {
    
    this.default_jwt_sign_options = {
      algorithm: this.jwt_algorithm
    }

    this.default_jwt_verify_options = {
      algorithm: this.jwt_algorithm
    }

    if (['HS256', 'HS384', 'HS512'].includes(this.jwt_algorithm)) {
      debug('using jwt algorithm %s', this.jwt_algorithm)
      if (!this.jwt_sign_secret) {
        this.jwt_sign_secret = process.env[environment_var_name] // JWT_SECRET
      }
      if (!this.jwt_sign_secret) throw new Error('Supply a jwt_sign_secret or env JWT_SECRET')
      this.jwt_public_key = false
    }
    else if (['RS256', 'RS384', 'RS512'].includes(this.jwt_algorithm) ) {
      debug('using jwt algorithm %s', this.jwt_algorithm)
      if (this.jwt_private_key_path || this.jwt_public_key_path) {
        this.jwt_sign_secret = readFileSync(this.jwt_private_key_path).toString()
        this.jwt_verify_secret = readFileSync(this.jwt_public_key_path).toString()
        this.jwt_public_key = this.jwt_verify_secret
      }
      if (!this.jwt_sign_secret && !this.jwt_verify_secret ) {
        // last thing is to generate an ephemeral keypair
        this.rotate_promise = this.rotateRsaKeyPair()
      }
      else if (!this.jwt_sign_secret) {
        throw new Error('Supply a private key via `jwt_private_key`')
      }
      else if (!this.jwt_verify_secret) {
        throw new Error('Supply a public key via `jwt_public_key`')
      }
    }
    else {
      throw new Error(`Algorithm not supported: [${this.jwt_algorithm}]`)
      // Could do PS* and ES* without key generation
    }
  }

  /**
   * Set a default options for the nodewebtoken `.verify` call
   * https://github.com/auth0/node-jsonwebtoken
   * @param {string} name     - Option key name
   * @param {*} value         - Option value
   */
  setJwtVerifyDefaultOption(name, value){
    this.default_jwt_verify_options[name] = value
    return this.default_jwt_verify_options
  }

  /**
   * Set a default options for the nodewebtoken `.sign` call
   * https://github.com/auth0/node-jsonwebtoken
   * @param {string} name     - Option key name
   * @param {*} value         - Option value
   */
  setJwtSignDefaultOption(name, value){
    this.default_jwt_sign_options[name] = value
    return this.default_jwt_sign_options
  }

  /**
   * Promise to create a JWT for some data
   * @param {object} data     - Date to be encoded in token
   * @param {*} options       - jsonwebtoken options override for this call
   * @returns {Promise<string>} JWT signed string
   */
  sign(data, options) {
    return new Promise((resolve, reject) => {
      if (data === undefined) {
        return reject(new WebException('Authentication Error', { status: 500, code: 'jwt_undefined_sign' }))
      }
      const final_options = (options)
        ? Object.assign({}, this.default_jwt_sign_options, options)
        : this.default_jwt_sign_options
      jwt.sign(
        data,
        this.jwt_sign_secret,
        final_options,
        (err, token) => {
          if (err) return reject(err)
          resolve(token)
        }
      )
    })
  }

  /**
   * Promise to decode a signed JWT token
   * @param {string} token          JWT Token string
   * @param {*} options             jsonwebtoken options override for this call
   * @returns {Promise<object>} Resolves the token data object
   */
  verify(token, options) {
    return new Promise((resolve, reject) => {
      const final_options = (options)
        ? Object.assign({}, this.default_jwt_verify_options, options)
        : this.default_jwt_verify_options
      jwt.verify(
        token,
        this.jwt_verify_secret,
        final_options,
        (err, data) => {
          if (err) {
            if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature'){
              const wrap_error = new WebException('Authentication Error', { status: 403, code: 'invalid_signature'})
              wrap_error.error = err
              return reject(wrap_error)
            }
            return reject(err)
          }
          /* istanbul ignore next */
          if (data === undefined) {
            return reject(new WebException('Authentication Error', { status: 500, code: 'jwt_undefined_verify' }))
          }
          resolve(data)
        }
      )
    })
  }

  /**
   * This is middleware for use in Koa
   * The verified/decoded token data is stored in `context.state.token`
   * The original token string is in `context.state.token_string`
   * The function needs to be bound to `Jwt` class instance.
   * @param {object} ctx        - Koa context object
   * @param {function} next    - Koa `next` promise
   * @example app.use(jwtinstance.koaVerifyJwtMiddleware.bind(jwtinstance))
   * @returns {undefined}
   */
  async koaVerifyJwtMiddleware(ctx, next) {
    const token_string = this.getJwtTokenFromKoaContext(ctx)
    const token_data = await this.verify(token_string)
    ctx.state.token = token_data // eslint-disable-line require-atomic-updates
    ctx.state.token_string = token_string // eslint-disable-line require-atomic-updates
    return next()
  }

  /**
   * @description Returns an instance bound middleware function. See `.koaVerifyJwtMiddleware`
   * @return {function} Koa middleware function to verify JWT header, bound to this instance
   * @example app.use(jwtinstance.koaMiddleware())
   */
  koaMiddleware() {
    return this.koaVerifyJwtMiddleware.bind(this)
  }

  /**
   * Creates a new JWT key pair, can auto generate, use params or read from file.
   * Maybe store the old one's for a bit so people don't get booted.
   * @params {object} options                     - Options object
   * @params {boolean} options.discard            - Discard old keys
   * @params {string} options.public_key          - New public key
   * @params {string} options.private_key         - New private key
   * @return {array.<{public_key: String, private_key: String}>} Array of private and public RSA key
   */
  async rotateRsaKeyPair(options  = {}) {
    if (options.discard) {
      this.last_jwt_sign_secret = null
      this.last_jwt_verify_secret = null
    } else {
      this.last_jwt_sign_secret = this.jwt_sign_secret
      this.last_jwt_verify_secret = this.jwt_verify_secret
    }

    // If we are using opts
    if (options.public_key && options.private_key){
      this.jwt_sign_secret = options.private_key
      this.jwt_verify_secret = options.public_key
    }
    // If we are using files
    else if (this.jwt_private_key_path || this.jwt_public_key_path) {
      this.jwt_sign_secret = await fsReadFile(this.jwt_private_key_path).toString()
      this.jwt_verify_secret = await fsReadFile(this.jwt_public_key_path).toString()
      this.jwt_public_key = this.jwt_verify_secret
    }
    else {
      const [public_key, private_key] = await this.constructor.generateRsaKeyPair()
      this.jwt_sign_secret = private_key
      this.jwt_verify_secret = public_key
    }

    // Store the pub key.. not sure why. 
    this.jwt_public_key = this.jwt_verify_secret
    
    // Return the keys like the node.js rsa generator
    return [this.jwt_verify_secret, this.jwt_sign_secret]
  }


  /**
   * This is middleware for use in Koa
   * The verified/decoded token data is stored in `context.state.token`
   * The original token string is in `context.state.token_string`
   * The function needs to be bound to `Jwt` class instance.
   * @param {object} ctx        - Koa context object
   * @param {function} next    - Koa `next` promise
   * @example app.use(jwtinstance.koaVerifyJwtCookieMiddleware.bind(jwtinstance))
   * @returns {undefined}
   */
  async koaVerifyJwtCookieMiddleware(ctx, next) {
    const cookie_token_string = this.getJwtTokenFromKoaContextCookie(ctx)
    const cookie_token_data = await this.verify(cookie_token_string)
    ctx.state.cookie_token = cookie_token_data // eslint-disable-line require-atomic-updates
    ctx.state.cookie_token_string = cookie_token_string // eslint-disable-line require-atomic-updates
    return next()
  }

  /**
   * @description Returns an instance bound middleware function. See `.koaVerifyJwtCookieMiddleware`
   * @return {function} Koa middleware function to verify JWT header, bound to this instance
   * @example app.use(jwtinstance.koaCookieMiddleware())
   */
  koaCookieMiddleware() {
    if (!this.koa_cookie) throw new Error('No koa_cookie set in JWT options')
    return this.koaVerifyJwtCookieMiddleware.bind(this)
  }

  /**
   * Get a JWT token from Koa headers
   * 
   * @param {object} context - Koa context object
   * @returns {string} - Parsed token
   */
  getJwtTokenFromKoaContextCookie(context) {
    if (!context) {
      throw new WebException('No context', { status: 400 })
    }
    if (!context.cookies) {
      throw new WebException('No cookies in context', { status: 400 })
    }
    const jwt_cookie = context.cookies.get(this.koa_cookie)
    if (!jwt_cookie) {
      throw new WebException('Authentication Error', { status: 403, code: 'authorization_cookie_missing' })
    }
    debug('context.cookies "%s"', this.koa_cookie, jwt_cookie)
    // return just the matched token
    return jwt_cookie
  }

}
