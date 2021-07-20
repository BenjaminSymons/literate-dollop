import * as uuid from 'uuid'
import handler from './libs/handler-lib'
import dynamoDb from './libs/dynamodb-lib'

export const create = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body)

  const courseID = 'COURSE#' + uuid.v4()

  const params = {
    TableName: process.env.tableName,
    Item: {
      // The attributes of the item to be created
      PK: courseID,
      SK: courseID,
      entityType: 'course',
      courseCode: data.courseCode,
      title: data.title,
      createdAt: Date.now(), // Current Unix timestamp
    },
  }

  await dynamoDb.put(params)

  return params.Item
})
