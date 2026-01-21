export type IngredientCategory = '전체' | '유제품' | '채소' | '과일' | '빵' | '육류' | '동물성' | '생선' | '과자' | '기타';

export const CATEGORIES: IngredientCategory[] = ['전체', '유제품', '채소', '과일', '빵', '육류', '동물성', '생선', '과자', '기타'];

export interface Ingredient {
  id: string;
  name: string;
  entryDate: string; // ISO string
  expiryDate: string; // ISO string
  category?: IngredientCategory;
}

export type ExpiryStatus = 'expired' | 'urgent' | 'safe';

