import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from '../utils'

const logger = createLogger('auth')

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl =
  'https://dev-ipd1t5ic12wexpbb.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const kid = jwt.header.kid

  // Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const response = await Axios(jwksUrl)
  const responseData = response.data
  const signingKey = responseData['keys'].find(
    (key) => key['kid'] === kid
  )
  if (!signingKey) {
    throw new Error('Invalid Signing key')
  }

  return verify(token, certToPEM(signingKey.x5c[0]), {
    algorithms: ['RS256']
  }) as JwtPayload

  // // Get JSON Web Key Certificate
  // const cert = await getJwkeyCertificate(jwksUrl, kid)

  // return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

// async function getJwkeyCertificate(uri: string, keyId: string): Promise<string> {
//   logger.info('Fetching json web key set!')
//   const res = await Axios.get(uri)
//   const keys = res.data.Keys

//   if (!keys) {
//     logger.info('Failed to  fetch keys-No keys found!')
//     throw new Error('Failed to  fetch keys-No keys found!')
//   }

//   const signingKey: Key = keys.find(
//     (key) =>
//       key.use === 'sig' && // JWK property `use` determines the JWK is for signature verification
//       key.kty === 'RSA' && // We are only supporting RSA (RS256)
//       key.kid === keyId)
  
//   if (!signingKey) {
//     logger.info(
//       'The JWKS endpoint did not contain the signature verification key'
//     )
//     throw new Error(
//       'The JWKS endpoint did not contain the signature verification key'
//     )
//   }
//   return certToPEM(signingKey.x5c[0])
// }


function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
