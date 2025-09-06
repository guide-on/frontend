export const searchFunds = async (keyword: string) => {
  const res = await axios.get('/api/funds/search', { params: { keyword } });
  return res.data;
};
import axios from 'axios';

export const getFundsList = async () => {
  const res = await axios.get('/api/funds');
  return res.data;
};

export const getFundDetail = async (fundsId: number) => {
  const res = await axios.get(`/api/funds/${fundsId}`);
  return res.data;
};

export const toggleBookmark = async (fundsId: number, saved: boolean) => {
  if (saved) {
    // 북마크 해제
    return axios.delete(`/api/saved-funds/${fundsId}`);
  } else {
    // 북마크 추가
    return axios.post(`/api/saved-funds/${fundsId}`);
  }
};

export const getBookmarkedFunds = async () => {
  const res = await axios.get('/api/saved-funds');
  return res.data;
};
