import api from '@/api';
import type { AxiosResponse } from 'axios';

export interface StoreSummaryResponse {
  sessionId: number;
  ownerId: number;
  businessRegistrationNo: string;
  currentMonth?: number;
  summaryYearMonth: string;
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
  weekdayAvgTransactionValue?: number;
  weekendAvgTransactionValue?: number;
  cashPaymentRatio?: number;
  cardPaymentRatio?: number;
  revisitCustomerSalesRatio?: number;
  newCustomerRatio?: number;
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
  operatingProfit?: number;
  costOfGoodsSold?: number;
  totalSalary?: number;
  operatingExpenses?: number;
  rentExpense?: number;
  otherExpenses?: number;
  operatingProfitRatio?: number;
  cogsRatio?: number;
  salaryRatio?: number;
  rentRatio?: number;
  operatingExpenseRatio?: number;
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
  createdDttm?: string;
  updatedDttm?: string;
  lastUpdatedDttm?: string;
}

export interface SalesDataRow {
  totalSalesAmount: number;
  weekdaySalesAmount: number;
  weekendSalesAmount: number;
  lunchSalesRatio: number;
  dinnerSalesRatio: number;
  transactionCount: number;
  weekdayTransactionCount: number;
  weekendTransactionCount: number;
  momGrowthRate: number;
  yoyGrowthRate: number;
  salesCv: number;
  avgTransactionValue: number;
  weekdayAvgTransactionValue: number;
  weekendAvgTransactionValue: number;
  cashPaymentRatio: number;
  cardPaymentRatio: number;
  revisitCustomerSalesRatio: number;
  newCustomerRatio: number;
}

export interface CsvUploadRequest {
  sessionId: number;
  summaryYearMonth: string;
  salesData: SalesDataRow[];
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

class StoreSummaryApi {
  async getMyStoreSummary(
    summaryYearMonth?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<StoreSummaryListResponse> {
    let url = `/api/store-summary/my-data?page=${page}&limit=${limit}`;
    if (summaryYearMonth) {
      url += `&summaryYearMonth=${summaryYearMonth}`;
    }
    const response: AxiosResponse<StoreSummaryListResponse> = await api.get(url);
    return response.data;
  }

  async getStoreSummaryByOwnerId(
    ownerId: number,
    summaryYearMonth?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<StoreSummaryListResponse> {
    let url = `/api/store-summary/owner/${ownerId}?page=${page}&limit=${limit}`;
    if (summaryYearMonth) {
      url += `&summaryYearMonth=${summaryYearMonth}`;
    }
    const response: AxiosResponse<StoreSummaryListResponse> = await api.get(url);
    return response.data;
  }

  async uploadCsvData(request: CsvUploadRequest): Promise<StoreSummaryDetailResponse> {
    const response: AxiosResponse<StoreSummaryDetailResponse> = await api.post(
      '/api/store-summary/upload-csv',
      request
    );
    return response.data;
  }
}

export const storeSummaryApi = new StoreSummaryApi();