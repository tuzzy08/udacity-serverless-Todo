import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      // Update a TODO item with the provided id using values in the "updatedTodo" object
      const user_Id = getUserId(event)

      await updateTodo(user_Id, todoId, updatedTodo)

      return {
        statusCode: 200,
        body: ''
      }
    } catch (error) {
      logger.error(`Failed to get update todo: ${error.message}`)
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
