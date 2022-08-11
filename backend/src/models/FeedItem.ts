export interface FeedItem {
  userId: string
  feedId: string
  createdAt: string
  name: string
  description: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
