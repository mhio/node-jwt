const RE_PUB_KEY = /-----BEGIN PUBLIC KEY-----[A-Z0-9/+=\n]{200,}-----END PUBLIC KEY-----/im
const RE_PRIVATE_KEY = /-----BEGIN PRIVATE KEY-----[A-Z0-9/+=\n]{350,}-----END PRIVATE KEY-----/im
const RE_JWT_TOKEN = /^[A-Za-z0-9]{36}\.[A-Za-z0-9]+\.[-_A-Za-z0-9]{43}$/

module.exports = { 
  RE_PUB_KEY,
  RE_PRIVATE_KEY,
  RE_JWT_TOKEN,
}