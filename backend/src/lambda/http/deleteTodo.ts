import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      // Remove a TODO item by id
      const user_Id = getUserId(event)
      await deleteTodo(user_Id, todoId)

      return {
        statusCode: 204,
        body: ''
      }
    } catch (error) {
       logger.error(`Failed to delete todo: ${error.message}`)
       return {
         statusCode: 500,
         body: `${error.message}`
       }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
