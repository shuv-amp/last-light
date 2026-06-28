export type Token = {
  id: string;
  isoDate: string; // YYYY-MM-DD, used for calendar lookup + storage
  date: string; // Display string, e.g. "Jun 28"
  day: string; // Display string, e.g. "Saturday"
  time: string; // Display string, e.g. "11:30 PM"
  word: string;
  colors: string[]; // 5 hex colors forming the palette
};

export type Mode = 'tonight' | 'archive';

export type Palette = {
  name: string;
  colors: string[];
};
