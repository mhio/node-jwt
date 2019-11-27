/* global expect */
const { Jwt, WebException } = require('../../')

describe('unit::jwt::module', function(){

  it('should create a Jwt', function(){
    expect( new Jwt({ jwt_sign_secret: 'test' }) ).to.be.ok
  })

  it('should create a WebException', function(){
    expect( new WebException() ).to.be.ok
  })
  
})
