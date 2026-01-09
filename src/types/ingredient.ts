export interface Ingredient {
  id: string;
  name: string;
  entryDate: string; // ISO string
  expiryDate: string; // ISO string
  category?: string;
}

export type ExpiryStatus = 'expired' | 'urgent' | 'safe';
