import * as uuid from 'uuid'
import handler from './libs/handler-lib'
import dynamoDb from './libs/dynamodb-lib'

export const create = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body)

  const user = event.requestContext?.identity.cognitoIdentityId

  if (user) {
    console.log(user)
  } else {
    console.log('No user in use')
  }

  const courseID = uuid.v4()

  const params = {
    TableName: process.env.tableName,
    Item: {
      // The attributes of the item to be created
      PK: 'COURSE',
      SK: `COURSE#${courseID}`,
      ID: courseID,
      entityType: 'course',
      courseCode: data.courseCode,
      title: data.title,
      description: data.description,
      createdAt: Date.now(), // Current Unix timestamp
    },
  }

  await dynamoDb.put(params)

  return params.Item
})

export const get = handler(async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: 'COURSE',
      SK: `COURSE#${event.pathParameters.id}`,
    },
  }

  const result = await dynamoDb.get(params)
  if (!result.Item) {
    throw new Error('Item not found.')
  }

  return result.Item
})

export const update = handler(async (event, callback) => {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: 'COURSE',
      SK: `COURSE#${event.pathParameters.id}`,
    },
    UpdateExpression:
      'SET title = :title, description = :description, courseCode = :courseCode',
    ExpressionAttributeValues: {
      ':title': data.title || null,
      ':description': data.description || null,
      ':courseCode': data.courseCode || null,
    },

    ReturnValues: 'ALL_NEW',
  }

  await dynamoDb.update(params)

  return { status: true }
})

export const list = handler(async (event, callback) => {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': 'COURSE',
    },
  }

  const result = await dynamoDb.query(params)

  return result.Items
})

export const remove = handler(async (event, callback) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: event.pathParameters.id,
      SK: `COURSE#${event.pathParameters.id}`,
    },
  }

  await dynamoDb.delete(params)

  return { status: true }
})
