import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from './Loading';
import {
  creditEvaluationApi,
  type CreditEvaluationCreateRequest,
  type CreditEvaluationResponse,
} from '../../api/creditEvaluationApi';
import {
  hybridCreditScoreApi
} from '../../api/hybridCreditScoreApi';

const Evaluating = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] =
    useState<CreditEvaluationResponse | null>(null);

  useEffect(() => {
    const evaluate = async () => {
      try {
        if (!sessionId) {
          throw new Error(
            '세션 ID가 없어 신용평가를 진행할 수 없습니다. 다시 로그인해주세요.',
          );
        }

        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 1, 95)); // Simulate progress
        }, 150);

        const evaluationData: CreditEvaluationCreateRequest = {
            sessionId: parseInt(sessionId),
            totalOverdueCount: 0,
            recent12mOverdueCount: 0,
            maxOverdueDays: 0,
            currentOverdueAmount: 0,
            loanDefaultHistory: 0,
            creditCardDelayRate: 5.2,
            paymentConsistencyScore: 85,
            totalDebtAmount: 50000000,
            monthlyIncome: 8000000,
            debtToIncomeRatio: 62.5,
            creditCardUtilizationRate: 35.0,
            securedVsUnsecuredRatio: 70.0,
            creditHistoryMonths: 48,
            oldestCreditAccountMonths: 72,
            newCreditInquiries6m: 2,
            activeCreditCardCount: 3,
            totalCreditLimit: 15000000,
            loanTypeDiversity: 4,
            financialInstitutionCount: 2,
            alternativeCreditScore: 72,
        };

        const creditResponse = await creditEvaluationApi.create(evaluationData);

        if (!creditResponse.success) {
          throw new Error(
            creditResponse.message || '신용평가 생성에 실패했습니다.',
          );
        }
        
        const hybridResponse = await hybridCreditScoreApi.calculate(
            parseInt(sessionId),
        );

        if (!hybridResponse.success) {
            throw new Error(
                hybridResponse.message || '하이브리드 신용점수 계산에 실패했습니다.',
            );
        }

        clearInterval(progressInterval);
        setProgress(100);
        setEvaluationResult(creditResponse.data);

        setTimeout(() => {
          navigate(`/hybrid-evaluation/complete/${sessionId}`);
        }, 500);

      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            '신용평가 처리 중 오류가 발생했습니다.',
        );
        console.error('Credit evaluation error:', err);
      }
    };

    evaluate();
  }, [sessionId, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600">
        <h2 className="text-xl font-bold mb-4">오류 발생</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(`/hybrid-evaluation/start/${sessionId}`)}
          className="mt-4 px-4 py-2 bg-blue text-white rounded"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return <LoadingOverlay progress={progress} />;
};

export default Evaluating;
