import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    // private readonly s3 = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly todosTable = process.env.TODOS_TABLE,
    
  ) {}

  async getTodoItems(userId: string) {
    logger.info(`Fetching all todos for ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    logger.info(
      `Found ${items.length} todos for user ${userId} in ${this.todosTable}`
    )

    return items
  }

  async getTodoItem(todoId: string): Promise<TodoItem> {
    logger.info(`Fetching todo item ${todoId}`)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId
        }
      })
      .promise()

    const item = result.Item

    return item as TodoItem
  }

  async createTodoItem(todoItem: TodoItem) {
    logger.info(`Creating todo ${todoItem.todoId}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
    return todoItem
  }

  async updateTodoItem(todoId: string, userId: string, todoUpdate: Partial<
    Omit<TodoItem, 'todoId' | 'createdAt' | 'userId' | 'attachmentUrl'>>) {
    logger.info(`Updating todo item ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done,
          ':userId': userId
        }
      })
      .promise()
  }

  async deleteTodoItembyId(todoId: string, userId: string) {
    logger.info(`Deleting todo ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId, userId },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
      .promise()
  }

  async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for todo ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        ConditionExpression: 'userId = :userId',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
          ':userId': userId
        }
      })
      .promise()
  }
}