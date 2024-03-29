import { expect } from 'chai'
import { join as pathJoin } from 'node:path'
import { readFileSync } from 'node:fs'
import { Jwt } from '../../src/Jwt.js'
import {
  RE_PUB_KEY,
  RE_PRIVATE_KEY,
  RE_JWT_TOKEN,
} from '../fixture/regex.js'

// __dirname in esm :/
import { dirname as pathDirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = pathDirname(fileURLToPath(import.meta.url))

describe('unit::jwt::Jwt', function(){

  it('should create a Jwt', function(){
    expect( new Jwt({ jwt_sign_secret: 'test' }) ).to.be.ok
  })

  it('should create a Jwt', function () {
    expect(Jwt).to.have.property('environment_var_name')
    expect(Jwt['environment_var_name']).to.have.equal('JWT_SECRET')
  })

  it('should generate an RSA keypair', async function() {
    const [ pub_key , priv_key ] = await Jwt.generateRsaKeyPair('test_string')
    expect(pub_key).to.match(RE_PUB_KEY)
    expect(priv_key).to.match(RE_PRIVATE_KEY)
  })
  
  describe('instance', function(){
    
    let jwt = null
    
    beforeEach(function(){
      jwt = new Jwt({ jwt_sign_secret: 'test' })
    })
    
    it('should return a function for .koaMiddleware', function(){
      const mw = jwt.koaMiddleware()
      expect( mw ).to.be.an.instanceOf(Function)
    })
    
    it('should return a function for .koaMiddleware', function () {
      jwt = new Jwt({ jwt_sign_secret: 'test', koa_cookie: 'download' })
      const mw = jwt.koaCookieMiddleware()
      expect(mw).to.be.an.instanceOf(Function)
    })

    it('should sign a token', async function(){
      const res = await jwt.sign({ bool: true })
      expect(res).to.match(RE_JWT_TOKEN)
    })

    it('should fail to sign a token without data', async function(){
      try {
        await jwt.sign(undefined)
      }
      catch (error) {
        return expect(error.message).to.equal('Authentication Error')
      }
      expect.fail('no error thrown')
    })

    it('should verify a signed token', async function () {
      const token = await jwt.sign({ bool: true })
      const res = await jwt.verify(token)
      expect(res).to.containSubset({ bool: true })
    })

    it('should fail to use a bad algo', function(){
      const fn = () => new Jwt({ jwt_algorithm: 'sdafkasl' })
      expect(fn).to.throw('Algorithm not supported')
    })

    it('should fail to use an unsupported algo', function(){
      const fn = () => new Jwt({ jwt_algorithm: 'ES256' })
      expect(fn).to.throw('Algorithm not supported')
    })

    it('should fail to use none algo', function(){
      const fn = () => new Jwt({ jwt_algorithm: 'none' })
      expect(fn).to.throw('Algorithm not supported')
    })
  
    it('should set pubkey to false when not using one', function(){
      expect(jwt.jwt_public_key).to.equal(false)
    })

    it('should generate an rsa key', async function(){
      jwt = new Jwt({ jwt_algorithm: 'RS256' })
      await jwt.rotate_promise
      expect(jwt.jwt_sign_secret).to.match(RE_PRIVATE_KEY)
      expect(jwt.jwt_verify_secret).to.match(RE_PUB_KEY)
      expect(jwt.jwt_public_key).to.equal(jwt.jwt_verify_secret)
    })

    it('should fail to use RSA with only private key', async function(){
      const fn = () => new Jwt({ jwt_algorithm: 'RS256', jwt_private_key: 'test' })
      expect(fn).to.throw('Supply a public key ')
    })

    it('should fail to use RSA with only public key', async function(){
      const fn = () => new Jwt({ jwt_algorithm: 'RS256', jwt_public_key: 'test' })
      expect(fn).to.throw('Supply a private key ')
    })

    it('should use a public/private key file', async function(){
      jwt = new Jwt({
        jwt_algorithm: 'RS256',
        jwt_private_key_path: pathJoin(__dirname,'..','fixture','jwtRS256.key'),
        jwt_public_key_path: pathJoin(__dirname, '..', 'fixture','jwtRS256.key.pub'),
      })
      expect(jwt.jwt_sign_secret).to.match(RE_PRIVATE_KEY)
      expect(jwt.jwt_verify_secret).to.match(RE_PUB_KEY)
      expect(jwt.jwt_public_key).to.equal(jwt.jwt_verify_secret)
    })

    it('should rotate while using a public/private key file', async function(){
      jwt = new Jwt({
        jwt_algorithm: 'RS256',
        jwt_private_key_path: pathJoin(__dirname,'..','fixture','jwtRS256.key'),
        jwt_public_key_path: pathJoin(__dirname, '..', 'fixture','jwtRS256.key.pub'),
      })
      const res = await jwt.rotateRsaKeyPair()
      expect(res).to.eql([jwt.jwt_verify_secret, jwt.jwt_sign_secret])
    })

    it('should rotate while using a public/private key file', async function(){
      const private_key = readFileSync(pathJoin(__dirname, '..', 'fixture', 'jwtRS256.key'))
      const public_key = readFileSync(pathJoin(__dirname, '..', 'fixture', 'jwtRS256.key.pub'))
      jwt = new Jwt({
        jwt_algorithm: 'RS256',
        jwt_private_key: private_key.toString(),
        jwt_public_key: public_key.toString(),
      })
      const res = await jwt.rotateRsaKeyPair({
        private_key: private_key.toString(),
        public_key: public_key.toString(),
      })
      expect(res).to.eql([ public_key.toString(), private_key.toString() ])
    })

    it('should set a default sign option', function(){
      jwt.setJwtSignDefaultOption('expiresIn', '2 days')
      expect(jwt.default_jwt_sign_options).to.containSubset({ expiresIn: '2 days' })
    })

    it('should set a default verify option', function(){
      jwt.setJwtVerifyDefaultOption('maxAge', '2 days')
      expect(jwt.default_jwt_verify_options).to.containSubset({maxAge: '2 days'})
    })

    it('should set a default verify option', function(){
      jwt.setJwtVerifyDefaultOption('maxAge', '2 days')
      expect(jwt.default_jwt_verify_options).to.containSubset({maxAge: '2 days'})
    })

    it('should produce a WebException for an invalid signature', async function(){
      const other_jwt = new Jwt({ jwt_sign_secret: 'othertest' })
      const bad_token = await other_jwt.sign({ ok: true })
      try {
        await jwt.verify(bad_token)
        expect.fail()
      }
      catch (error) {
        expect(error.name).to.equal('WebException')
        expect(error.message).to.equal('Authentication Error')
        expect(error.code).to.equal('invalid_signature')
        expect(error.error).to.be.ok
      }
    })

    it('should fail to get a jwt token', function(){
      jwt = new Jwt({ koa_cookie: 'test', jwt_sign_secret: 'test' })
      const fn = () => jwt.getJwtTokenFromKoaContextCookie()
      expect(fn).to.throw('No context')
    })

    it('should fail to get a jwt token', function(){
      jwt = new Jwt({ koa_cookie: 'test', jwt_sign_secret: 'test' })
      const fn = () => jwt.getJwtTokenFromKoaContextCookie({})
      expect(fn).to.throw('No cookies in context')
    })
    
    it('should fail to get a jwt token', function(){
      jwt = new Jwt({ koa_cookie: 'test', jwt_sign_secret: 'test' })
      const fn = () => jwt.getJwtTokenFromKoaContextCookie({
        cookies: { get(){ return undefined }}
      })
      expect(fn).to.throw('Authentication Error')
    })
    
    it('should get a jwt token from cookie header "test"', function(){
      jwt = new Jwt({ koa_cookie: 'test', jwt_sign_secret: 'test' })
      expect( jwt.getJwtTokenFromKoaContextCookie({ cookies: { get(){ return 'testthing' }}})).to.equal('testthing')
    })
  })

})
