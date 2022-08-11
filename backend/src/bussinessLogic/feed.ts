import { FeedsAccess } from '../dataLayer/feedsAcess'
import { FeedItem } from '../models/FeedItem'
import { FeedUpdate } from '../models/FeedUpdate'
import { CreateFeedRequest } from '../requests/CreateFeedRequest'
import { UpdateFeedRequest } from '../requests/UpdateFeedRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('Process feed application')
const feedsAccess = new FeedsAccess()
export async function getAllFeedsForUser(userId: string): Promise<FeedItem[]> {
    logger.info('Process get all feed for user id ' + userId);
    return feedsAccess.getAllFeedsForUser(userId)
}
export async function createFeed(userId: string, newFeed: CreateFeedRequest): Promise<FeedItem> {
  const createdAt = new Date().toISOString()  
  const feedId = uuid.v4()
  let newItem: FeedItem = {
    userId,
    feedId,
    createdAt,
    done: false,
    ...newFeed,
    attachmentUrl: ''
  }
  logger.info('Process to create feed for item ' + newItem);
  return await feedsAccess.createFeed(newItem)
}
  
export async function updateFeed(userId: string, feedId: string, updatedFeed: UpdateFeedRequest): Promise<FeedUpdate> {
  let feedUpdate: FeedUpdate = {...updatedFeed}
  logger.info('Process to update feed with user id ' + userId);
  return feedsAccess.updateFeed(userId, feedId, feedUpdate)
}

export async function updateAttachmentUrl(userId: string, feedId: string, attachmentUrl: string): Promise<string> {
  logger.info('Process to update Url for user id ' + userId);
  return feedsAccess.updateAttachmentUrl(userId, feedId, attachmentUrl)
}

export async function deleteFeed(userId: string, feedId: string) {
  logger.info('Process to delete feed with user id ' + userId);
  return feedsAccess.deleteFeed(userId, feedId)
    
}