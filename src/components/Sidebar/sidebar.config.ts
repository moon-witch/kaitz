export type StoryKey = 'fantasy' | 'dystopia' | 'magic';

export interface LinkItem {
  type: 'link';
  label: string;
  to: string;
}

export interface DropItem {
  type: 'drop';
  key: StoryKey;
  label: string;
  items: string[];
}

export type NavItemData = LinkItem | DropItem;

// Story item arrays
export const fantasyItems: string[] = [
  'A story about a boy...',
  'Thousands of years ago...',
  'Marvel is the best...'
];

export const dystopiaItems: string[] = [
  'When the lights went out...',
  'City in ruins...',
  'Hope fades...'
];

export const magicItems: string[] = [
  'Wands at dawn...',
  'Dragons awaken...',
  'Spells fly...'
];

// Combined navigation items
export const navItems: NavItemData[] = [
  { type: 'link', label: 'Landing', to: '/logo' },
  { type: 'link', label: 'News',    to: '/logo' },
  { type: 'link', label: 'Diary',   to: '/logo' },
  { type: 'drop', key: 'fantasy',  label: 'Fantasy',  items: fantasyItems },
  { type: 'drop', key: 'dystopia', label: 'Dystopia', items: dystopiaItems },
  { type: 'drop', key: 'magic',    label: 'Magic',    items: magicItems }
];
