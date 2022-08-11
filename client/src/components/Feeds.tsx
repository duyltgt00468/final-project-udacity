import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createFeed, deleteFeed, getFeeds, patchFeed } from '../api/feeds-api'
import Auth from '../auth/Auth'
import { Feed } from '../types/Feed'
import Dialog from '../auth/Dialog'


interface FeedsProps {
  auth: Auth
  history: History
}

interface FeedsState {
  feeds: Feed[]
  newFeedName: string
  newFeedDescription: string
  loadingFeeds: boolean
  isDialogOpen: boolean
  deleteFeedId: string
  isViewDialogOpen: boolean
  viewFeedId: string
  viewFeedName: string
  viewFeedDescription: string
  viewFeedCreateDate: string
  viewFeedDueDate: string
  viewFeedURL: string | undefined
  viewFeedStatus: boolean
}

export class Feeds extends React.PureComponent<FeedsProps, FeedsState> {
  state: FeedsState = {
    feeds: [],
    newFeedName: '',
    newFeedDescription: '',
    loadingFeeds: true,
    isDialogOpen: false,
    deleteFeedId: '',
    isViewDialogOpen: false,
    viewFeedId: '',
    viewFeedName: '',
    viewFeedDescription: '',
    viewFeedCreateDate: '',
    viewFeedDueDate: '',
    viewFeedURL: '',
    viewFeedStatus: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFeedName: event.target.value })
  }

  handleDesciptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFeedDescription: event.target.value })
  }

  onEditButtonClick = (feedId: string) => {
    this.props.history.push(`/feeds/${feedId}/edit`)
  }

  onFeedCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newFeed = await createFeed(this.props.auth.getIdToken(), {
        name: this.state.newFeedName,
        description: this.state.newFeedDescription,
        dueDate
      })
      this.setState({
        feeds: [...this.state.feeds, newFeed],
        newFeedName: '',
        newFeedDescription: ''
      })
    } catch {
      alert('Create Feed Failed.')
    }
  }

  onFeedDelete = async (feedId: string) => {
    try {
      await deleteFeed(this.props.auth.getIdToken(), feedId)
      this.setState({
        feeds: this.state.feeds.filter(feed => feed.feedId !== feedId)
      })
      this.setState({ isDialogOpen: false })
    } catch {
      alert('Create Feed Failed.')
    }
  }

  onConfirmDeleteFeed = async (feedId: string) => {
    this.setState({ isDialogOpen: !this.state.isDialogOpen })
    this.setState({deleteFeedId: feedId})
  }

  onViewFeed = async (feedId: string, feedName: string, feedDescription: string, feedCreateDate: string, feedDueDate: string, feedURL: string | undefined, feedStatus: boolean) => {
    this.setState({ isViewDialogOpen: !this.state.isViewDialogOpen })
    this.setState({
    viewFeedId: feedId,
    viewFeedName: feedName,
    viewFeedDescription: feedDescription,
    viewFeedCreateDate: feedCreateDate,
    viewFeedDueDate: feedDueDate,
    viewFeedURL: feedURL,
    viewFeedStatus: feedStatus
  })
  console.log(this.state.isViewDialogOpen)

  }

  // onFeedView = async (feedId: string) => {
  //   try {
  //     const feeds = await viewFeed(this.props.auth.getIdToken(), feedId)
  //     this.setState({
  //       feeds
  //     })
  //   } catch {
  //     alert('Can not view Feed')
  //   }
  // }

  onFeedCheck = async (pos: number) => {
    try {
      const feed = this.state.feeds[pos]
      await patchFeed(this.props.auth.getIdToken(), feed.feedId, {
        name: feed.name,
        description: feed.description,
        dueDate: feed.dueDate,
        done: !feed.done
      })
      this.setState({
        feeds: update(this.state.feeds, {
          [pos]: { done: { $set: !feed.done } }
        })
      })
    } catch {
      alert('Can not check this feed')
    }
  }

  async componentDidMount() {
    try {
      const feeds = await getFeeds(this.props.auth.getIdToken())
      this.setState({
        feeds,
        loadingFeeds: false
      })
    } catch (e) {
      alert(`Failed to fetch feeds: ${(e as Error).message}`)
    }
  }

  render() {
    const feedCount = this.state.feeds.length;
    return (
      <div>
        <Header as="h1">TOTAL FEEDS: {feedCount}</Header>

        {this.renderCreateFeedInput()}

        {this.renderFeeds()}
      </div>
    )
  }

  renderCreateFeedInput() {
    return (
      <Grid.Row>
        <Grid.Column width={15}>
          <Input
            id='name'
            fluid
            placeholder="Input name here..."
            onChange={this.handleNameChange}
            maxLength='10'
            value={this.state.newFeedName}
          />
          <hr></hr>
          <Input
            id='description'
            action={{
              color: 'green',
              labelPosition: 'right',
              icon: 'add',
              content: 'New feed',
              onClick: this.onFeedCreate
            }}
            fluid
            placeholder="Input description here..."
            onChange={this.handleDesciptionChange}
            maxLength='30'
            value={this.state.newFeedDescription}
          />
          <hr></hr>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderFeeds() {
    if (this.state.loadingFeeds) {
      return this.renderLoading()
    }

    return this.renderFeedsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Feeds...
        </Loader>
      </Grid.Row>
    )
  }

  renderFeedsList() {
    return (
      <Grid padded>
        {this.state.feeds.map((feed, pos) => {
          return (
            <Grid.Row key={feed.feedId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onFeedCheck(pos)}
                  checked={feed.done}
                />
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                Title: {feed.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                Des:{feed.description.length > 10? feed.description.slice(0,7) +'...' : feed.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {feed.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(feed.feedId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onViewFeed(feed.feedId, feed.name, feed.description, feed.createdAt, feed.dueDate, feed.attachmentUrl, feed.done)}
                >
                  <Icon name="eye" />
                </Button>
                <Dialog open={this.state.isViewDialogOpen}>
                  <h1>Detail of Feed</h1>
                  <p></p>
                  <p>Feed Id : {this.state.viewFeedId}</p>
                  <p>Feed Name : {this.state.viewFeedName}</p>
                  <p>Feed Description : {this.state.viewFeedDescription}</p>
                  <p>Create At : {this.state.viewFeedCreateDate}</p>
                  <p>Due Date : {this.state.viewFeedDueDate}</p>
                  <p>Image URL : {this.state.viewFeedURL && this.state.viewFeedURL.length > 0? this.state.viewFeedURL : "Empty"}</p>
                  <p>Status : {this.state.viewFeedStatus ? 'Done' : 'Not Done'}</p>
                  <div style={{ flex: 1 }} />
                  <p></p>
                  <Button
                    className="button"
                    onClick={() => this.setState({ isViewDialogOpen: false })}
                  >
                    OK
                  </Button>
                </Dialog>               
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  // onClick={() => this.setState({ isDialogOpen: !this.state.isDialogOpen })}
                  //onClick={() => this.onFeedDelete(feed.feedId)}
                  onClick={() => this.onConfirmDeleteFeed(feed.feedId)}
                >
                  <Icon name="delete" />
                </Button>
                <Dialog open={this.state.isDialogOpen}>
                  <h1>Delete Feed</h1>
                  <p></p>
                  <p>Are you sure to delete feed : {this.state.deleteFeedId}?</p>
                  <div style={{ flex: 1 }} />
                  <Button
                    className="button"
                    onClick={() => this.onFeedDelete(this.state.deleteFeedId)}
                  >
                    OK
                  </Button>
                  <p></p>
                  <Button
                    className="button"
                    onClick={() => this.setState({ isDialogOpen: false })}
                  >
                    Cancel
                  </Button>
                </Dialog>
              </Grid.Column>
              {feed.attachmentUrl && (
                <Image src={feed.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>            
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return  dateFormat(date, 'yyyy-mm-dd') as string
  }
}
