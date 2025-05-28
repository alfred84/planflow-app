export interface TrelloBoard {
  id: string
  name: string
  desc: string
  url: string
  dateLastActivity: string
  prefs: {
    backgroundColor: string
    backgroundImage?: string
  }
}

export interface TrelloList {
  id: string
  name: string
  pos: number
  closed: boolean
}

export interface TrelloCard {
  id: string
  name: string
  desc: string
  pos: number
  due: string | null
  dateLastActivity: string
  idList: string
  labels: TrelloLabel[]
  members: TrelloMember[]
  closed: boolean
}

export interface TrelloLabel {
  id: string
  name: string
  color: string
}

export interface TrelloMember {
  id: string
  fullName: string
  username: string
  avatarHash: string
}