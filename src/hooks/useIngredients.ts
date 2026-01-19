import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Ingredient } from '../types/ingredient';
import { getRemainingDays } from '../utils/date';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      // Supabase snake_case to camelCase mapping
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        entryDate: item.entry_date,
        expiryDate: item.expiry_date,
        category: item.category
      }));

      setIngredients(mappedData);
    } catch (e) {
      console.error('Failed to fetch ingredients', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .insert([{
          name: ingredient.name,
          entry_date: ingredient.entryDate,
          expiry_date: ingredient.expiryDate,
          category: ingredient.category
        }]);

      if (error) throw error;

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

  return { ingredients, loading, addIngredient, removeIngredient };
};
