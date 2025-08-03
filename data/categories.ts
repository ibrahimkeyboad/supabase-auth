import { Category } from '@/types/product';

export const categories: Category[] = [
  {
    id: 'c1',
    name: 'Seeds',
  },
  {
    id: 'c2',
    name: 'Fertilizers',
  },
  {
    id: 'c3',
    name: 'Crop Protection',
  },
  {
    id: 'c4',
    name: 'Plant Growth Enhancers',
  },
  {
    id: 'c5',
    name: 'Farm Equipment',
  },
  {
    id: 'c6',
    name: 'Tools',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category?.name || 'Unknown Category';
};