import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getAllFeedsForUser } from '../../bussinessLogic/feed'
import { getUserId } from '../utils';
import { createLogger } from "../../utils/logger";

const logger = createLogger("get-feed");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const userId = getUserId(event)
      const feeds = await getAllFeedsForUser(userId)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: feeds
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
handler.use(
  cors({
    credentials: true
  })
)
