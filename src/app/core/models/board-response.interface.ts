export interface TrelloBoardResponse {
    id:                string;
    nodeId:            string;
    name:              string;
    desc:              string;
    descData:          null;
    closed:            boolean;
    dateClosed:        null;
    idOrganization:    string;
    idEnterprise:      null;
    limits:            Limits;
    pinned:            boolean;
    starred:           boolean;
    url:               string;
    prefs:             Prefs;
    shortLink:         string;
    subscribed:        boolean;
    labelNames:        LabelNames;
    powerUps:          any[];
    dateLastActivity:  Date | null;
    dateLastView:      Date | null;
    shortUrl:          string;
    idTags:            any[];
    datePluginDisable: null;
    creationMethod:    string;
    ixUpdate:          string;
    templateGallery:   null;
    enterpriseOwned:   boolean;
    idBoardSource:     null;
    premiumFeatures:   string[];
    idMemberCreator:   string;
    type:              null;
    memberships:       Membership[];
}

export interface LabelNames {
    green:        string;
    yellow:       string;
    orange:       string;
    red:          string;
    purple:       string;
    blue:         string;
    sky:          string;
    lime:         string;
    pink:         string;
    black:        string;
    green_dark:   string;
    yellow_dark:  string;
    orange_dark:  string;
    red_dark:     string;
    purple_dark:  string;
    blue_dark:    string;
    sky_dark:     string;
    lime_dark:    string;
    pink_dark:    string;
    black_dark:   string;
    green_light:  string;
    yellow_light: string;
    orange_light: string;
    red_light:    string;
    purple_light: string;
    blue_light:   string;
    sky_light:    string;
    lime_light:   string;
    pink_light:   string;
    black_light:  string;
}

export interface Limits {
    attachments:        Attachments;
    boards:             Boards;
    cards:              Cards;
    checklists:         Attachments;
    checkItems:         CheckItems;
    customFields:       CustomFields;
    customFieldOptions: CustomFieldOptions;
    labels:             CustomFields;
    lists:              Lists;
    stickers:           Stickers;
    reactions:          Reactions;
}

export interface Attachments {
    perBoard: PerBoard;
    perCard:  PerBoard;
}

export interface PerBoard {
    status:    Status;
    disableAt: number;
    warnAt:    number;
}

export enum Status {
    Ok = "ok",
}

export interface Boards {
    totalMembersPerBoard:        PerBoard;
    totalAccessRequestsPerBoard: PerBoard;
}

export interface Cards {
    openPerBoard:  PerBoard;
    openPerList:   PerBoard;
    totalPerBoard: PerBoard;
    totalPerList:  PerBoard;
}

export interface CheckItems {
    perChecklist: PerBoard;
}

export interface CustomFieldOptions {
    perField: PerBoard;
}

export interface CustomFields {
    perBoard: PerBoard;
}

export interface Lists {
    openPerBoard:  PerBoard;
    totalPerBoard: PerBoard;
}

export interface Reactions {
    perAction:       PerBoard;
    uniquePerAction: PerBoard;
}

export interface Stickers {
    perCard: PerBoard;
}

export interface Membership {
    id:          string;
    idMember:    string;
    memberType:  string;
    unconfirmed: boolean;
    deactivated: boolean;
}

export interface Prefs {
    permissionLevel:          string;
    hideVotes:                boolean;
    voting:                   string;
    comments:                 string;
    invitations:              string;
    selfJoin:                 boolean;
    cardCovers:               boolean;
    showCompleteStatus:       boolean;
    cardCounts:               boolean;
    isTemplate:               boolean;
    cardAging:                string;
    calendarFeedEnabled:      boolean;
    hiddenPluginBoardButtons: any[];
    switcherViews:            SwitcherView[];
    autoArchive:              null;
    background:               string;
    backgroundColor:          string;
    backgroundDarkColor:      null;
    backgroundImage:          string;
    backgroundDarkImage:      null;
    backgroundImageScaled:    null;
    backgroundTile:           boolean;
    backgroundBrightness:     string;
    sharedSourceUrl:          null;
    backgroundBottomColor:    string;
    backgroundTopColor:       string;
    canBePublic:              boolean;
    canBeEnterprise:          boolean;
    canBeOrg:                 boolean;
    canBePrivate:             boolean;
    canInvite:                boolean;
}

export interface SwitcherView {
    viewType: string;
    enabled:  boolean;
}
