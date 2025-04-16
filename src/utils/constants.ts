import { Winner } from '../types';

export const WINNERS_TABLE_HEADERS: {
  text: string;
  sortable: boolean;
  key?: keyof Winner;
}[] = [
  { text: 'Number', sortable: false },
  { text: 'Car', sortable: false },
  { text: 'Name', sortable: false },
  { text: 'Wins', sortable: true, key: 'wins' },
  { text: 'Best time (seconds)', sortable: true, key: 'time' },
];

export const WINNERS_PER_PAGE: number = 10;
export const CAR_ANIMATION_OFFSET: number = 10;
