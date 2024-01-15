export const RE_PUB_KEY = /-----BEGIN (?:RSA )?PUBLIC KEY-----[A-Z0-9/+=\n]{200,}-----END (?:RSA )?PUBLIC KEY-----/im
export const RE_PRIVATE_KEY = /-----BEGIN (?:RSA )?PRIVATE KEY-----[A-Z0-9/+=\n]{350,}-----END (?:RSA )?PRIVATE KEY-----/im
export const RE_JWT_TOKEN = /^[A-Za-z0-9]{36}\.[A-Za-z0-9]+\.[-_A-Za-z0-9]{43}$/