/* global expect */
const { Jwt } = require('../../lib/Jwt')
const {
  RE_PUB_KEY,
  RE_PRIVATE_KEY,
  RE_JWT_TOKEN,
} = require('../fixture/regex')

describe('unit::jwt::Jwt', function(){

  it('should create a Jwt', function(){
    expect( new Jwt({ jwt_sign_secret: 'test' }) ).to.be.ok
  })

  it('should create a Jwt', function () {
    expect(Jwt).to.have.property('environment_var_name')
    expect(Jwt['environment_var_name']).to.have.equal('JWT_SECRET')
  })

  it('should genarate an RSA keypair', async function() {
    const [ pub_key , priv_key ] = await Jwt.generateRsaKeyPair('test_string')
    expect(pub_key).to.match(RE_PUB_KEY)
    expect(priv_key).to.match(RE_PRIVATE_KEY)
  })
  
  describe('instance', function(){
    
    let jwt = null
    
    before(function(){
      jwt = new Jwt({ jwt_sign_secret: 'test' })
    })
    
    it('should return a function for .koaMiddleware', function(){
      const mw = jwt.koaMiddleware()
      expect( mw ).to.be.an.instanceOf(Function)
    })
    
    it('should sign a token', async function(){
      const res = await jwt.sign({ bool: true })
      expect(res).to.match(RE_JWT_TOKEN)
    })

    it('should verify a signed token', async function () {
      const token = await jwt.sign({ bool: true })
      const res = await jwt.verify(token)
      expect(res).to.containSubset({ bool: true })
    })

  })

})
