import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodos as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

const logger = createLogger('getTodosForUser')

// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
       const user_id = await getUserId(event)
       const todo_items = await getTodosForUser(user_id)

       return {
         statusCode: 200,
         body: JSON.stringify({
           items: todo_items
         })
       }
    } catch (error) {
      logger.error(`Failed to get todos: ${error.message}`)
      return {
        statusCode: 500,
        body: `${error.message}`
      }
    }
   
  })
handler.use(
  cors({
    credentials: true
  })
)
