import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Ingredient, IngredientCategory } from '../types/ingredient';
import { getRemainingDays } from '../utils/date';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // 식재료 이름으로 카테고리 유추
  const getCategoryByName = (name: string): IngredientCategory => {
    const dairy = ['우유', '치즈', '요거트', '버터', '생크림', '요구르트'];
    const vegetables = ['양파', '당근', '파', '마늘', '고추', '깻잎', '상추', '배추', '무', '감자', '고구마', '브로콜리', '양배추', '버섯', '오이', '호박', '콩나물', '시금치'];
    const fruits = ['사과', '바나나', '포도', '딸기', '수박', '참외', '복숭아', '귤', '오렌지', '키위', '토마토', '레몬', '블루베리'];
    const bread = ['빵', '식빵', '바게트', '베이글', '도넛', '떡'];
    const meat = ['돼지고기', '소고기', '닭고기', '오리고기', '햄', '소시지', '삼겹살', '목살', '베이컨'];
    const animal = ['계란', '달걀', '메추리알'];
    const fish = ['고등어', '갈치', '조기', '연어', '참치', '멸치', '어묵', '새우', '오징어', '문어', '전복', '굴', '게'];
    const snack = ['과자', '초콜릿', '캔디', '사탕', '젤리', '쿠키', '감자칩'];

    if (dairy.some(item => name.includes(item))) return '유제품';
    if (vegetables.some(item => name.includes(item))) return '채소';
    if (fruits.some(item => name.includes(item))) return '과일';
    if (bread.some(item => name.includes(item))) return '빵';
    if (meat.some(item => name.includes(item))) return '육류';
    if (animal.some(item => name.includes(item))) return '동물성';
    if (fish.some(item => name.includes(item))) return '생선';
    if (snack.some(item => name.includes(item))) return '과자';

    return '기타';
  };

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      // Supabase snake_case to camelCase mapping
      const mappedData = (data || []).map(item => {
        let category = item.category;

        // 카테고리 이름 변경: 고기 -> 육류
        if (category === '고기') category = '육류';

        // 특정 식재료 재분류: 계란/달걀 -> 동물성
        if (['계란', '달걀', '메추리알'].some(egg => item.name.includes(egg))) {
          category = '동물성';
        }

        return {
          id: item.id,
          name: item.name,
          entryDate: item.entry_date,
          expiryDate: item.expiry_date,
          category: category || getCategoryByName(item.name)
        };
      });

      setIngredients(mappedData);
    } catch (e) {
      console.error('Failed to fetch ingredients', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredient_suggestions')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;
      setSuggestions((data || []).map(s => s.name));
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchSuggestions();
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      setAdding(true);
      const category = ingredient.category || getCategoryByName(ingredient.name);

      const { error } = await supabase
        .from('ingredients')
        .insert([{
          name: ingredient.name,
          entry_date: ingredient.entryDate,
          expiry_date: ingredient.expiryDate,
          category: category
        }]);

      if (error) throw error;

      // 새 식재료인 경우 자동완성 목록에도 추가
      if (!suggestions.includes(ingredient.name)) {
        await supabase
          .from('ingredient_suggestions')
          .insert([{
            name: ingredient.name,
            category: category
          }])
          .select()
          .single();
        await fetchSuggestions();
      }

      // 3일 이내 만료인 경우 즉시 푸시 알림 호출
      const diffDays = getRemainingDays(ingredient.expiryDate);
      console.log(`[Push Debug] 품목: ${ingredient.name}, 남은 기한: ${diffDays}일`);

      if (diffDays <= 3) {
        console.log('[Push Debug] 3일 이내 품목 감지: Edge Function 호출 시도...');
        // Supabase Edge Function 호출
        const { data, error: invokeError } = await supabase.functions.invoke('send-notifications', {
          body: { name: ingredient.name, expiry_date: ingredient.expiryDate }
        });

        if (invokeError) {
          console.error('[Push Debug] Edge Function 호출 실패:', invokeError);
        } else {
          console.log('[Push Debug] Edge Function 호출 성공:', data);
        }
      }

      await fetchIngredients();
    } catch (e) {
      console.error('Failed to add ingredient', e);
    } finally {
      setAdding(false);
    }
  };

  const removeIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchIngredients();
    } catch (e) {
      console.error('Failed to remove ingredient', e);
    }
  };

  const updateIngredient = async (id: string, updates: Partial<Omit<Ingredient, 'id'>>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name;
        // 이름이 변경되면 카테고리도 다시 유추 (명시적 카테고리가 없는 경우)
        if (!updates.category) {
          updateData.category = getCategoryByName(updates.name);
        }
      }
      if (updates.entryDate !== undefined) updateData.entry_date = updates.entryDate;
      if (updates.expiryDate !== undefined) updateData.expiry_date = updates.expiryDate;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await fetchIngredients();
    } catch (e) {
      console.error('Failed to update ingredient', e);
    }
  };

  return { ingredients, suggestions, loading, adding, addIngredient, updateIngredient, removeIngredient, getCategoryByName };
};

