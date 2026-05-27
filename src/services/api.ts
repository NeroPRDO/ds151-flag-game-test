import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type ScoreType = 'scores' | 'timedscores';

export interface ScoreRecord {
  id?: number | string;
  name: string;
  score: number;
  createdAt?: string;
}

function getApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0];

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();

export async function saveScore(type: ScoreType, name: string, score: number) {
  const response = await fetch(`${API_BASE_URL}/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      score,
      createdAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao salvar pontuação: ${response.status}`);
  }

  return response.json();
}

export async function getScores(type: ScoreType): Promise<ScoreRecord[]> {
  const response = await fetch(`${API_BASE_URL}/${type}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar placar: ${response.status}`);
  }

  const data = await response.json();

  return data.sort((a: ScoreRecord, b: ScoreRecord) => b.score - a.score);
}
