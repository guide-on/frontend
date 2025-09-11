import api from '@/api';
import type { AxiosResponse } from 'axios';

export interface StoreSummaryResponse {
  sessionId?: number;
  businessRegistrationNo?: string;
  
  // 매출 관련 (매출성장성 및 안정성)
  totalSalesAmount?: number;
  weekdaySalesAmount?: number;
  weekendSalesAmount?: number;
  lunchSalesRatio?: number;
  dinnerSalesRatio?: number;
  transactionCount?: number;
  weekdayTransactionCount?: number;
  weekendTransactionCount?: number;
  momGrowthRate?: number;
  yoyGrowthRate?: number;
  salesCv?: number;
  avgTransactionValue?: number;
  cashPaymentRatio?: number;
  cardPaymentRatio?: number;
  revisitCustomerSalesRatio?: number;
  newCustomerRatio?: number;
  
  // 생성/수정 일시
  createdDttm?: string;
  updatedDttm?: string;
  lastUpdatedDttm?: string;
  
  // ESG 관련
  electricityUsageKwh?: number;
  electricityBillAmount?: number;
  gasUsageM3?: number;
  waterUsageTon?: number;
  energyEffApplianceRatio?: number;
  participateEnergyEffSupport?: boolean;
  participateHighEffEquipSupport?: boolean;
  foodWasteKgPerDay?: number;
  recycleWasteKgPerDay?: number;
  yellowUmbrellaMember?: boolean;
  yellowUmbrellaMonths?: number;
  yellowUmbrellaAmount?: number;
  employmentInsuranceEmployees?: number;
  customerReviewAvgRating?: number;
  customerReviewPositiveRatio?: number;
  hygieneCertified?: boolean;
  originPriceViolationCount?: number;
  
  // 재무 관련
  operatingProfit?: number;
  costOfGoodsSold?: number;
  totalSalary?: number;
  rentExpense?: number;
  otherExpenses?: number;
  operatingProfitRatio?: number;
  cogsRatio?: number;
  salaryRatio?: number;
  rentRatio?: number;
  
  // 현금흐름 건전성 관련
  cashPaymentRatioDetail?: number;
  cardPaymentRatioDetail?: number;
  otherPaymentRatio?: number;
  weightedAvgCashPeriod?: number;
  cashflowCv?: number;
  avgAccountBalance?: number;
  minBalanceMaintenanceRatio?: number;
  excessiveWithdrawalFrequency?: number;
  rentPaymentComplianceRate?: number;
  utilityPaymentComplianceRate?: number;
  salaryPaymentRegularity?: number;
  taxPaymentIntegrity?: number;
}

export interface StoreSummaryListResponse {
  success: boolean;
  message: string;
  data: StoreSummaryResponse[];
}

export interface StoreSummaryDetailResponse {
  success: boolean;
  message: string;
  data: StoreSummaryResponse;
}

export interface SalesDataRow {
  totalSalesAmount?: number;
  weekdaySalesAmount?: number;
  weekendSalesAmount?: number;
  lunchSalesRatio?: number;
  dinnerSalesRatio?: number;
  transactionCount?: number;
  weekdayTransactionCount?: number;
  weekendTransactionCount?: number;
  momGrowthRate?: number;
  yoyGrowthRate?: number;
  salesCv?: number;
  avgTransactionValue?: number;
  cashPaymentRatio?: number;
  cardPaymentRatio?: number;
  revisitCustomerSalesRatio?: number;
  newCustomerRatio?: number;
}

export interface StoreSummaryCsvUploadRequest {
  sessionId: number;
  businessRegistrationNo: string;
  salesData: SalesDataRow[];
}

class StoreSummaryApi {
  async getMyStoreSummary(
    sessionId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<StoreSummaryListResponse> {
    const url = `/api/store-summary/my-data/${sessionId}?page=${page}&limit=${limit}`;
    const response: AxiosResponse<StoreSummaryListResponse> = await api.get(url);
    return response.data;
  }

  async uploadCsvData(
    request: StoreSummaryCsvUploadRequest
  ): Promise<StoreSummaryDetailResponse> {
    const response: AxiosResponse<StoreSummaryDetailResponse> = await api.post(
      '/api/store-summary/upload-csv',
      request
    );
    return response.data;
  }

  async updateCashflowData(sessionId: number): Promise<StoreSummaryDetailResponse> {
    const response: AxiosResponse<StoreSummaryDetailResponse> = await api.put(
      `/api/store-summary/update-cashflow/${sessionId}`
    );
    return response.data;
  }

  async updateEsgData(sessionId: number, energyEffRatio: number): Promise<StoreSummaryDetailResponse> {
    const response: AxiosResponse<StoreSummaryDetailResponse> = await api.put(
      `/api/store-summary/update-esg/${sessionId}?energyEffRatio=${energyEffRatio}`
    );
    return response.data;
  }
}

export const storeSummaryApi = new StoreSummaryApi();