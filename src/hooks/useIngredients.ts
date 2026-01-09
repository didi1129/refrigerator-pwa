import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Ingredient } from '../types/ingredient';

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
