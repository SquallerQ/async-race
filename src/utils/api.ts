import { fetch } from '../browserTypes';
import { Car, Winner } from '../types';
import { console } from '../browserTypes';
export const fetchCars = async (
  page: number = 1,
  limit: number = 7,
): Promise<{ cars: Car[]; total: number }> => {
  const response = await fetch(
    `http://127.0.0.1:3000/garage?_page=${page}&_limit=${limit}`,
    { method: 'GET' },
  );
  if (!response.ok) throw new Error('Failed to fetch cars');
  const totalCount = response.headers.get('X-Total-Count');
  const total = totalCount ? parseInt(totalCount, 10) : 0;
  const cars = await response.json();
  return { cars, total };
};

export const fetchCar = async (id: number): Promise<Car | null> => {
  const response = await fetch(`http://127.0.0.1:3000/garage/${id}`, {
    method: 'GET',
  });
  if (!response.ok) return null;
  return await response.json();
};

export const createCar = async (name: string, color: string): Promise<void> => {
  await fetch('http://127.0.0.1:3000/garage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
};

export const deleteCar = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:3000/garage/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete car');
};

export const deleteWinner = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:3000/winners/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404)
    throw new Error('Failed to delete winner');
};

export const startEngine = async (
  id: number,
): Promise<{ velocity: number; distance: number }> => {
  const response = await fetch(
    `http://127.0.0.1:3000/engine?id=${id}&status=started`,
    { method: 'PATCH' },
  );
  if (!response.ok) throw new Error('Failed to start engine');
  return await response.json();
};

export const stopEngine = async (id: number): Promise<void> => {
  const response = await fetch(
    `http://127.0.0.1:3000/engine?id=${id}&status=stopped`,
    { method: 'PATCH' },
  );
  if (!response.ok) throw new Error('Failed to stop engine');
};

export const driveCar = async (id: number): Promise<{ success: boolean }> => {
  const response = await fetch(
    `http://127.0.0.1:3000/engine?id=${id}&status=drive`,
    { method: 'PATCH' },
  );
  if (!response.ok) {
    if (response.status === 500) return { success: false };
    throw new Error(await response.text());
  }
  return { success: true };
};

export const fetchWinners = async (
  page: number = 1,
  limit: number = 10,
  sort: 'wins' | 'time' = 'wins',
  order: 'ASC' | 'DESC' = 'DESC',
): Promise<{ winners: Winner[]; total: number }> => {
  try {
    const response = await fetch(
      `http://127.0.0.1:3000/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`,
      { method: 'GET' },
    );
    if (!response.ok) throw new Error('Failed to fetch winners');
    const totalCount = response.headers.get('X-Total-Count');
    const total = totalCount ? parseInt(totalCount, 10) : 0;
    const winners = await response.json();
    return { winners, total };
  } catch (error) {
    console.error('Error fetching winners:', error);
    return { winners: [], total: 0 };
  }
};

export const saveWinner = async (
  carId: number,
  time: number,
): Promise<void> => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/winners/${carId}`, {
      method: 'GET',
    });
    if (response.ok) {
      const winner: Winner = await response.json();
      const newWins = winner.wins + 1;
      const newTime = time < winner.time ? time : winner.time;
      await fetch(`http://127.0.0.1:3000/winners/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wins: newWins, time: newTime }),
      });
    } else if (response.status === 404) {
      await fetch('http://127.0.0.1:3000/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: carId, wins: 1, time }),
      });
    }
  } catch (error) {
    console.error('Error saving winner:', error);
  }
};

export const updateCar = async (
  carId: number,
  name: string,
  color: string,
): Promise<Car> => {
  const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!response.ok) throw new Error('Failed to update car');
  return await response.json();
};
