import { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { UploadCard } from './UploadCard';
import {
  storeSummaryApi,
  type StoreSummaryCsvUploadRequest,
  type SalesDataRow,
} from '../../../api/storeSummaryApi';

type CategoryKey = 'sales' | 'cashflow' | 'esg' | 'ceo';

interface SalesSectionProps {
  content: { title: string; desc: string; items: string[] };
  fileNames: Record<CategoryKey, string | undefined>;
  completed: Record<CategoryKey, boolean>;
  error: string | null;
  isSubmitting: boolean;
  sessionId: string;
  onHelpClick: () => void;
  onAttachHelpClick: () => void;
  onFileUpload: (file: File) => void;
  onSubmit?: () => void;
  onCsvUploadComplete: (fileName: string) => void;
}

export const SalesSection: React.FC<SalesSectionProps> = ({
  content,
  fileNames,
  completed,
  error,
  isSubmitting,
  sessionId,
  onHelpClick,
  onAttachHelpClick,
  onFileUpload,
  onSubmit,
  onCsvUploadComplete,
}) => {
  // CSV 업로드 관련 상태
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [csvUploadSuccess, setCsvUploadSuccess] = useState(false);

  // CSV 파일 파싱 함수
  const parseCsvFile = (file: File): Promise<SalesDataRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim());

          if (lines.length < 2) {
            reject(new Error('CSV 파일이 비어있거나 헤더만 있습니다.'));
            return;
          }

          // 첫 번째 줄은 헤더
          const headers = lines[0].split(',').map((h) => h.trim());
          const expectedHeaders = [
            'total_sales_amount',
            'weekday_sales_amount',
            'weekend_sales_amount',
            'lunch_sales_ratio',
            'dinner_sales_ratio',
            'transaction_count',
            'weekday_transaction_count',
            'weekend_transaction_count',
            'mom_growth_rate',
            'yoy_growth_rate',
            'sales_cv',
            'avg_transaction_value',
            'cash_payment_ratio',
            'card_payment_ratio',
            'revisit_customer_sales_ratio',
            'new_customer_ratio',
          ];

          // 헤더 검증
          const missingHeaders = expectedHeaders.filter(
            (header) => !headers.includes(header),
          );
          if (missingHeaders.length > 0) {
            reject(
              new Error(
                `필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}`,
              ),
            );
            return;
          }

          // 데이터 파싱
          const salesData: SalesDataRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v) => v.trim());
            if (values.length !== headers.length) {
              reject(
                new Error(`${i + 1}번째 행의 컬럼 수가 일치하지 않습니다.`),
              );
              return;
            }

            const row: SalesDataRow = {};
            headers.forEach((header, index) => {
              const value = values[index];
              if (value && value !== '') {
                // snake_case를 camelCase로 변환
                const camelCaseHeader = header.replace(
                  /_([a-z])/g,
                  (match, letter) => letter.toUpperCase(),
                );
                (row as any)[camelCaseHeader] = parseFloat(value) || 0;
                console.debug(
                  `🔄 변환: ${header} -> ${camelCaseHeader} = ${value}`,
                );
              }
            });
            salesData.push(row);
          }

          if (salesData.length === 0) {
            reject(new Error('CSV 파일에 데이터가 없습니다.'));
            return;
          }

          resolve(salesData);
        } catch (error) {
          reject(
            new Error(
              `CSV 파싱 중 오류가 발생했습니다: ${error instanceof Error ? error.message : error}`,
            ),
          );
        }
      };
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
      reader.readAsText(file);
    });
  };

  // CSV 파일 업로드 처리 함수
  const handleCsvUpload = async (file: File) => {
    if (!sessionId) {
      setCsvUploadError('세션 ID가 없습니다.');
      return;
    }

    // 파일 유효성 검사
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvUploadError('CSV 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB 제한
      setCsvUploadError('파일 크기가 10MB를 초과할 수 없습니다.');
      return;
    }

    if (file.size === 0) {
      setCsvUploadError('빈 파일은 업로드할 수 없습니다.');
      return;
    }

    try {
      setIsUploadingCsv(true);
      setCsvUploadError(null);
      setCsvUploadSuccess(false);

      console.log('🔄 CSV 파일 파싱 시작:', file.name);

      // CSV 파일 파싱
      const salesData = await parseCsvFile(file);
      console.log('📊 파싱된 데이터:', salesData);

      // API 요청 데이터 구성
      const uploadRequest: StoreSummaryCsvUploadRequest = {
        sessionId: parseInt(sessionId),
        businessRegistrationNo: '000-00-00000', // 기본값 또는 사용자 입력값
        salesData: salesData,
      };

      console.log('📡 CSV 업로드 API 호출:', uploadRequest);

      // API 호출
      const response = await storeSummaryApi.uploadCsvData(uploadRequest);

      if (response.success) {
        console.log('✅ CSV 업로드 성공:', response.message);
        setCsvUploadSuccess(true);

        // 상위 컴포넌트에 업로드 완료 알림
        onCsvUploadComplete(file.name);
      } else {
        throw new Error(response.message || 'CSV 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ CSV 업로드 실패 - 전체 에러 객체:', error);
      console.error('❌ 에러 응답:', error?.response);
      console.error('❌ 에러 응답 데이터:', error?.response?.data);
      console.error('❌ 에러 상태 코드:', error?.response?.status);
      console.error('❌ 에러 메시지:', error?.message);
      console.error('❌ 요청 설정:', error?.config);

      // 서버 에러 응답에서 더 구체적인 메시지 추출
      let errorMessage = 'CSV 업로드 중 오류가 발생했습니다.';

      if (error?.response?.status === 500) {
        const serverError =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Internal Server Error';
        errorMessage = `서버 오류 (500): ${serverError}`;
        console.error('❌ 서버 500 오류 상세:', serverError);
      } else if (error?.response?.status === 400) {
        errorMessage =
          error?.response?.data?.message ||
          '잘못된 요청입니다. CSV 파일 형식을 확인해주세요.';
      } else if (error?.response?.status === 404) {
        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      } else {
        errorMessage = `네트워크 오류가 발생했습니다. (상태: ${error?.response?.status || 'unknown'})`;
      }

      setCsvUploadError(errorMessage);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  return (
    <>
      <h3 className="text-xl font-bold text-navy">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.desc}</p>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">평가 항목</span>
        <button
          aria-label="도움말"
          onClick={onHelpClick}
          className="text-blue hover:text-navy"
        >
          <FaQuestionCircle />
        </button>
      </div>

      <div className="rounded-xl p-3 text-sm space-y-1 bg-white shadow-[0_12px_36px_rgba(17,24,39,0.06)] ">
        {content.items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="font-semibold text-gray-900">관련 서류 첨부</span>
        <button
          aria-label="도움말"
          onClick={onAttachHelpClick}
          className="text-blue hover:text-navy"
        >
          <FaQuestionCircle />
        </button>
      </div>

      {/* <div className="mt-2 p-3 border border-gray-200 rounded-xl bg-blue-50 shadow-[0_12px_36px_rgba(17,24,39,0.06)]">
          <p className="text-sm text-gray-700 mb-2">
            <strong>CSV 파일 형식:</strong> 다음 컬럼들을 포함해야 합니다.
          </p>
          <p className="text-xs text-gray-600 break-all">
            총 매출액, 평일 매출액, 주말 매출액, 점심 매출 비율, <br />
            저녁 매출 비율, 거래 건수, 평일 거래 건수, 주말 거래 건수, <br />
            전월 대비 성장률, 전년 대비 성장률, 매출 변동계수, <br />
            평균 거래 금액, 현금 결제 비율, 카드 결제 비율, <br />
            재방문 고객 매출 비율, 신규 고객 비율
          </p>
        </div> */}

      <UploadCard
        fileName={fileNames.sales}
        acceptedFileTypes=".csv"
        onPdfPicked={(f) => {
          // 매출 안정성 탭에서는 CSV 파일만 허용
          if (!f.name.endsWith('.csv')) {
            setCsvUploadError('매출 데이터는 CSV 파일만 업로드 가능합니다.');
            return;
          }
          // CSV 파일 업로드 처리
          handleCsvUpload(f);
        }}
      />

      {isUploadingCsv && (
        <div className="mt-3 text-center py-2">
          <p className="text-sm text-blue-600">CSV 파일 업로드 중...</p>
        </div>
      )}

      {csvUploadError && (
        <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {csvUploadError}
        </div>
      )}

      {csvUploadSuccess && (
        <div className="mt-3 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
          ✅ CSV 파일이 성공적으로 업로드되었습니다!
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !onSubmit}
        className="mt-4 w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '처리 중...' : '제출하기'}
      </button>
    </>
  );
};
