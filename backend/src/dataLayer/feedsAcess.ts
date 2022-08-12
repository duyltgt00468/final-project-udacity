import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { FeedItem } from '../models/FeedItem'
import { FeedUpdate } from '../models/FeedUpdate';
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('Process dataLayer for Feeds')

export class FeedsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly feedsTable = process.env.FEEDS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
    ) {
    }

    async getAllFeedsForUser(userId: string): Promise<FeedItem[]> {
        const result = await this.docClient.query({
            TableName: this.feedsTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise()
        const items = result.Items
        return items as FeedItem[]
    }

    async createFeed(newItem: FeedItem): Promise<FeedItem> {
        await this.docClient.put({
            TableName: this.feedsTable,
            Item: newItem
        }).promise()
        return newItem
    }

    async updateFeed(userId: string, feedId: string, feedUpdate: FeedUpdate): Promise<FeedUpdate> {
        await this.docClient.update({
            TableName: this.feedsTable,
            Key: {
                userId: userId,
                feedId: feedId
            },
            UpdateExpression: 'set #dynobase_name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': feedUpdate.name,
                ':description': feedUpdate.description,
                ':dueDate': feedUpdate.dueDate,
                ':done': feedUpdate.done,
            },
            ExpressionAttributeNames: { "#dynobase_name": "name" }
        }).promise()
        return feedUpdate
    }

    async updateAttachmentUrl(userId: string, feedId: string, uploadUrl: string): Promise<string> {
        await this.docClient.update({
            TableName: this.feedsTable,
            Key: {
                userId: userId,
                feedId: feedId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        }).promise()
        logger.info('result: ' + uploadUrl);
        return uploadUrl
    }

    async deleteFeed(userId: string, feedId: string) {
        logger.info('delete feedId', feedId)
        await this.docClient.delete({
            TableName: this.feedsTable,
            Key: {
                feedId,
                userId
            },
            ConditionExpression: 'feedId = :feedId',
            ExpressionAttributeValues: {
                ':feedId': feedId
            }
        }).promise()

        const params = {
            Bucket: this.bucketName,
            Key: feedId
        }
        
        await this.s3.deleteObject(params, function (err, data) {
            if (err) logger.info('error while deleting object', err.stack)
            else logger.info(data)
        }).promise()
    }   
}

function createDynamoDBClient(): DocumentClient {
    const service = new AWS.DynamoDB()
    const client = new AWS.DynamoDB.DocumentClient({
      service: service
    })
    AWSXRay.captureAWSClient(service)
    return client
  }