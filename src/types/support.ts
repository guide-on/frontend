export type SupportCenter = {
  id: number;
  name: string;
  jurisdiction: string;
  address: string;
  phone: string;
  fax: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
};

export type NearestCenterResponse = {
  center: SupportCenter;
  distanceKm: number;
  rank: number;
};

export type NearestCentersData = {
  searchedAddress: string;
  businessLat: number;
  businessLng: number;
  nearestCenters: NearestCenterResponse[];
};

export type Filters = {
  keywords: string[];
  types: string[];
  purposes: string[];
  rates: string[];
  limit: [number, number];
};

export type FundListItem = {
  id: number;
  name: string;
  status: string;
  target: string;
  rate: string;
  term: string;
  limitAmount: string;
  saved: boolean;
};

export type FundDetail = FundListItem & {
  purpose: string;
  createdAt: string;
  updatedAt?: string;
  categoryCode: string;
  year: number;
};

export type MainFilter = 'none' | 'filter' | 'map' | 'receiving' | 'bookmark';

export type PlaceDetail = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};