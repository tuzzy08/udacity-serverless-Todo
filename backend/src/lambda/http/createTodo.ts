import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      // Implement creating a new TODO item
      const user_id = await getUserId(event)
      const newTodoItem = await createTodo(user_id, newTodo)

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: newTodoItem
        })
      }
    } catch (error) {
      logger.error(`Failed generating upload url: ${error.message}`)
      return {
        statusCode: 500,
        body: `${error.message}`
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
