import { createCar } from './api';
import { console } from '../browserTypes';

const CAR_NAMES = [
  'Tesla',
  'BMW',
  'Audi',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Mercedes',
  'Ford',
  'Chevrolet',
  'Toyota',
  'Honda',
  'Nissan',
  'Subaru',
];

const CAR_MODELS = [
  'Model S',
  'M5',
  'A4',
  'C-Class',
  'B4',
  'CC-2',
  'MC-6',
  '488',
  '911',
  'MX-5',
  'WRX',
  'MCA',
];

const CAR_COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#A52A2A',
  '#800080',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCarName(): string {
  const randomBrand = getRandomElement(CAR_NAMES);
  const randomModel = getRandomElement(CAR_MODELS);
  return `${randomBrand} ${randomModel}`;
}

function generateCarColor(): string {
  return getRandomElement(CAR_COLORS);
}

export async function generateHundredCars(
  onComplete?: () => Promise<void>,
): Promise<void> {
  try {
    for (let i = 0; i < 100; i++) {
      const name = generateCarName();
      const color = generateCarColor();
      await createCar(name, color);
    }

    if (onComplete) {
      await onComplete();
    }
  } catch (error) {
    console.error(error);
  }
}
