export interface Feed {
  feedId: string
  createdAt: string
  name: string
  description: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
