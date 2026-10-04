import { IconName } from './icons';

function norm(s?: string): string {
  if (!s) {
    return '';
  }
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CATEGORY_ICON: Record<string, IconName> = {
  'tecnologia y celulares': 'headphones',
  'mercado gastronomico': 'burger',
  'terraza gourmet el cuarto': 'wine',
  'moda y ropa exclusiva': 'shirt',
  'calzado y maroquineria': 'shoe',
  'joyeria y relojes': 'gem',
  'sky games y ocio': 'gamepad',
};

const FLOOR_ICON: Record<string, IconName> = {
  'piso 1': 'shirt',
  'piso 2': 'headphones',
  'piso 3': 'burger',
  'piso 4': 'wine',
  'todos': 'building',
};

const STATUS_ICON: Record<string, IconName> = {
  recibido: 'note-edit',
  confirmado: 'check',
  preparando: 'users',
  enpreparacion: 'users',
  en_preparacion: 'users',
  en_camino: 'map-pin',
  enreparto: 'map-pin',
  listo_retiro: 'package',
  listo: 'package',
  entregado: 'party',
  retirado: 'party',
  cancelado: 'x',
};

const FILTER_ICON: Record<string, IconName> = {
  todos: 'tag',
  todoslosproductos: 'tag',
  todoslosproductosdelaapp: 'tag',
  audio: 'headphones',
  celulares: 'smartphone',
  tecnologia: 'headphones',
  moda: 'shirt',
  ropa: 'shirt',
  calzado: 'shoe',
  joyeria: 'gem',
  relojes: 'gem',
  gastronomia: 'burger',
  hamburguesas: 'burger',
  comida: 'burger',
  restaurante: 'wine',
  bar: 'wine',
  cafeteria: 'coffee',
  postres: 'pizza',
  juegos: 'gamepad',
  entretenimiento: 'gamepad',
  general: 'tag',
  default: 'tag',
};

export function categoryIcon(cat: { nombre?: string | null }): IconName {
  const key = norm(cat?.nombre || '');
  if (key in CATEGORY_ICON) {
    return CATEGORY_ICON[key] as IconName;
  }
  return 'tag';
}

export function floorIcon(floor: string): IconName {
  const key = norm(floor || '');
  if (key in FLOOR_ICON) {
    return FLOOR_ICON[key] as IconName;
  }
  return 'building';
}

export function statusIcon(status: string): IconName {
  const key = norm(status || '');
  if (key in STATUS_ICON) {
    return STATUS_ICON[key] as IconName;
  }
  return 'note-edit';
}

export function filterIcon(key: string): IconName {
  const k = norm(key || '');
  if (k in FILTER_ICON) {
    return FILTER_ICON[k] as IconName;
  }
  return 'tag';
}
