import axios from 'axios';
import type { SpecsApiResponse, GuideApiResponse, GuideHistoryApiResponse, RankingsApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
});

export async function fetchSpecs(): Promise<SpecsApiResponse> {
  const res = await api.get<SpecsApiResponse>('/specs');
  return res.data;
}

export async function fetchGuide(specName: string): Promise<GuideApiResponse> {
  const res = await api.get<GuideApiResponse>(`/guides/${specName}`);
  return res.data;
}

export async function fetchGuideHistory(specName: string): Promise<GuideHistoryApiResponse> {
  const res = await api.get<GuideHistoryApiResponse>(`/guides/${specName}/history`);
  return res.data;
}

export async function fetchHistoricalGuide(specName: string, id: string): Promise<GuideApiResponse> {
  const res = await api.get<GuideApiResponse>(`/guides/${specName}/history/${id}`);
  return res.data;
}

export async function fetchRankings(): Promise<RankingsApiResponse> {
  const res = await api.get<RankingsApiResponse>('/rankings');
  return res.data;
}
