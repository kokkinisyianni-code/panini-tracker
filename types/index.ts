export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: string;
}

export interface Sticker {
  id: string;
  number: number;
  name: string;
  team: string;
  category: StickerCategory;
  section?: string;
}

export type StickerCategory =
  | 'player'
  | 'team_badge'
  | 'team_photo'
  | 'logo'
  | 'stadium'
  | 'special'
  | 'cover'
  | 'group'
  | 'past_champion';

export interface CollectionEntry {
  id?: string;
  userId: string;
  stickerId: string;
  collected: boolean;
  duplicates: number;
  updatedAt: string;
}

export interface Collectible {
  id?: string;
  userId: string;
  name: string;
  description: string;
  category: CollectibleCategory;
  owned: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CollectibleCategory =
  | 'album'
  | 'tin'
  | 'multipack'
  | 'limited_edition'
  | 'display_box'
  | 'other';

export interface TradeOffer {
  id?: string;
  offeredBy: string;
  offeredByName: string;
  neededBy: string;
  neededByName: string;
  stickerId: string;
  stickerNumber: number;
  stickerName: string;
  stickerTeam: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface UserStats {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  collected: number;
  total: number;
  percentage: number;
  duplicates: number;
  missing: number;
}

export interface TeamProgress {
  team: string;
  total: number;
  users: {
    uid: string;
    displayName: string;
    collected: number;
    percentage: number;
  }[];
}

export interface PossibleTrade {
  sticker: Sticker;
  hasUser: User;
  duplicateCount: number;
  needsUser: User;
}
