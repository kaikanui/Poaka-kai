export interface FoodItem {
  id: string;
  name: string;
  maori: string;
  emoji: string;
  image?: string;
  color: string;
}

export const KAI_LIST: FoodItem[] = [
  { id: 'apple', name: 'Apple', maori: 'Āporo', emoji: '🍎', color: 'bg-red-400' },
  { id: 'banana', name: 'Banana', maori: 'Panana', emoji: '🍌', color: 'bg-yellow-300' },
  { id: 'sandwich', name: 'Sandwich', maori: 'Hanawiti', emoji: '🥪', color: 'bg-orange-200' },
  { id: 'orange', name: 'Orange', maori: 'Ārani', emoji: '🍊', color: 'bg-orange-400' },
  { id: 'strawberry', name: 'Strawberry', maori: 'Rōpere', emoji: '🍓', color: 'bg-red-500' },
  { id: 'biscuit', name: 'Cookie / Biscuit', maori: 'Pihikete', emoji: '🍪', color: 'bg-amber-600' },
  { id: 'cheese', name: 'Cheese', maori: 'Tīhi', emoji: '🧀', color: 'bg-yellow-400' },
  { id: 'carrot', name: 'Carrot', maori: 'Kēreti', emoji: '🥕', color: 'bg-orange-500' },
  { id: 'milk', name: 'Milk', maori: 'Miraka', emoji: '🥛', color: 'bg-blue-100' },
  { id: 'water', name: 'Water', maori: 'Wai', emoji: '💧', color: 'bg-blue-300' },
  { id: 'grapes', name: 'Grapes', maori: 'Karepe', emoji: '🍇', color: 'bg-purple-400' },
  { id: 'egg', name: 'Egg', maori: 'Hēki', emoji: '🥚', color: 'bg-slate-100' },
  { id: 'honey', name: 'Honey', maori: 'Mīere', emoji: '🍯', color: 'bg-pink-100' },
  { id: 'pear', name: 'Pear', maori: 'Peara', emoji: '🍐', color: 'bg-green-300' },
  { id: 'tomato', name: 'Tomato', maori: 'Tōmato', emoji: '🍅', color: 'bg-red-600' },
  { id: 'cucumber', name: 'Cucumber', maori: 'Kūkamo', emoji: '🥒', color: 'bg-green-600' },
  { id: 'muffin', name: 'Muffin', maori: 'Mawhene', emoji: '🧁', color: 'bg-pink-300' },
  { id: 'bread', name: 'Bread', maori: 'Parāoa', emoji: '🍞', color: 'bg-yellow-100' },
];

export const LOCATIONS = {
  roto: { maori: 'Roto', english: 'Inside/In' },
  runga: { maori: 'Runga', english: 'On/On top of' },
};

export const CONTAINERS = {
  lunchbox: { maori: 'Pouaka kai', english: 'Lunch box', icon: '🍱' },
  plate: { maori: 'Pereti', english: 'Plate', icon: '🍽️' },
};
