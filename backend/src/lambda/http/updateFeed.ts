import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateFeed } from '../../bussinessLogic/feed'
import { UpdateFeedRequest } from '../../requests/UpdateFeedRequest'
import { getUserId } from '../utils'
import { createLogger } from "../../utils/logger";

const logger = createLogger("update-feed");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const feedId = event.pathParameters.feedId
    try {
      const updatedFeed: UpdateFeedRequest = JSON.parse(event.body)
      const userId = getUserId(event)
      const resultItem = await updateFeed(userId, feedId, updatedFeed)
      if(resultItem.name.trim() == ""){
        return {
          statusCode: 400,
          body: "Input Feed Name"
        }
      }
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          resultItem
        })
      }
    } catch (e) {
      logger.error(e.message)
      return {
        statusCode: 500,
        body: e.message
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
