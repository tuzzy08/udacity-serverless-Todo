//  Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'nf0npubzz6'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-ipd1t5ic12wexpbb.us.auth0.com', // Auth0 domain
  clientId: 'Yobx3WPeXImiqr9ZLlRxV9oV1m1omCis', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
