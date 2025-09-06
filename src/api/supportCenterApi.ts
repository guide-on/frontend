import axios from 'axios';

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

// 전체 지원센터 목록 조회
export const getAllSupportCenters = async () => {
  try {
    const response = await axios.get('/api/support-centers');
    return {
      status: response.status,
      data: response.data.data?.centers || [],
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('전체 센터 목록 조회 실패:', error);
    return {
      status: error.response?.status || 500,
      data: [],
      message: '센터 목록을 불러오는데 실패했습니다.',
    };
  }
};

// 가까운 지원센터 조회
export const getNearestSupportCenters = async (
  businessAddress: string,
  limit = 1,
) => {
  try {
    const response = await axios.post('/api/support-centers/nearest', {
      businessAddress,
      limit,
    });

    return {
      status: response.status,
      data: response.data.data as NearestCentersData,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('가까운 센터 조회 실패:', error);
    return {
      status: error.response?.status || 500,
      data: null,
      message: '가까운 센터를 찾는데 실패했습니다.',
    };
  }
};

// 사업장 주소 조회 (사용자 정보에서)
export const getBusinessAddress = async () => {
  try {
    const response = await axios.get('/api/member/info');

    return {
      status: response.status,
      address: response.data.data?.businessAddress || null,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('사업장 주소 조회 실패:', error);

    // 404일 경우 임시로 더미 데이터 반환
    if (error.response?.status === 404) {
      console.log('API 엔드포인트가 구현되지 않음. 더미 데이터 사용.');
      //todo 사용자에게서 사업자 주소 받아와야함
      return {
        status: 200,
        address: '서울특별시 영등포구 국제금융로8길 26 (여의도동)', // 임시 더미 주소
        message: '임시 더미 데이터',
      };
    }

    // 다른 에러 발생 시에도 더미 데이터 반환
    return {
      status: 200,
      address: '서울특별시 영등포구 국제금융로8길 26 (여의도동)', // 임시 더미 주소
      message: '임시 더미 데이터 (에러로 인한 fallback)',
    };
  }
};
