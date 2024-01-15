import { use } from 'chai'
// import ChaiFs from 'chai-fs'
// import SinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'

// globalThis.expect = chai.expect
// use(ChaiFs)
// use(SinonChai)
use(chaiSubset)

if ( process.env.NODE_ENV === undefined ) {
  process.env.NODE_ENV = 'test'
}
