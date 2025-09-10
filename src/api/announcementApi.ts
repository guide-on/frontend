import api from '@/api';

export type Announcement = {
  id: number;
  region: string;
  industry: string;
  target: string;
  title: string;
  agency: string;
  applyPeriod: string;
  category: string;
  applyStatus: string;
  noticeTitle: string;
  recruitType: string;
  programType: string;
  projectPeriod: string;
  applyDetail: string;
  description: string;
  attachments: string;
  tags: string | null;
  consultPeriod: string;
  createdAt: string;
}

export type AnnouncementListResponse = {
  status: number;
  message: string;
  data: {
    announcements: Announcement[];
  };
}

export type AnnouncementDetailResponse = {
  status: number;
  message: string;
  data: Announcement;
  success: boolean;
}

export const getAnnouncementsList =
  async (): Promise<AnnouncementListResponse> => {
    const response = await api.get('/api/support-announcements');
    return response.data;
  };

export const getAnnouncementDetail = async (
  id: number,
): Promise<AnnouncementDetailResponse> => {
  const response = await api.get(`/api/support-announcements/${id}`);
  return response.data;
};
