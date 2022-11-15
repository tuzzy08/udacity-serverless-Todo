import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// Implement businessLogic

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export async function getTodos(userId: string) {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoItem: newItem
  })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  logger.info(`Updating todo ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoUpdate: updateTodoRequest
  })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `User ${userId} does not have permission to update todo ${todoId}`
    )
    throw new Error('User is not authorized to update item') 
  }

  todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

  return await todosAccess.deleteTodoItembyId(todoId, userId)
}

// export async function updateAttachmentUrl(
//   userId: string,
//   todoId: string,
// ) {
  
//   const attachmentUrl = await AttachmentUtils.getAttachmentUrl(todoId)

//   logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, {
//     userId,
//     todoId
//   })

//   const item = await todosAccess.getTodoItem(todoId)

//   if (!item) throw new Error('Item not found') // FIXME: 404?

//   if (item.userId !== userId) {
//     logger.error(
//       `User ${userId} does not have permission to update todo ${todoId}`
//     )
//     throw new Error('User is not authorized to update item') // FIXME: 403?
//   }

//   await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
// }

export async function generateUploadUrl(todoID: string, userId: string): Promise<string> {
  logger.info(`Generating upload URL for attachment ${todoID}`)
  const attachmentUrl = AttachmentUtils.getAttachmentUrl(todoID)

  const uploadUrl = await AttachmentUtils.getSignedUrl(todoID)

  await todosAccess.updateAttachmentUrl(todoID, userId, attachmentUrl)

  return uploadUrl
}
