import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateFeedRequest } from '../../requests/CreateFeedRequest'
import { getUserId } from '../utils';
import { createFeed } from '../../bussinessLogic/feed'
import { createLogger } from "../../utils/logger";

const logger = createLogger("create-feed");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      
      const newFeed: CreateFeedRequest = JSON.parse(event.body)
      if(newFeed.name.trim() == ""){
        return {
          statusCode: 400,
          body: "Input Feed name"
        }
      }else{
        const userId = getUserId(event)
        const item = await createFeed(userId, newFeed)
        return {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            item
          })
        }
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
