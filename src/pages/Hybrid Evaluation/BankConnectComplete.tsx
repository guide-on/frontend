import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';



export default function BankConnectComplete() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation() as { state?: { banks?: string[] } };
  const banks = location.state?.banks || [];
  return (
    <>

      <div className="px-4 py-10 text-center space-y-4">
      <FaCheckCircle className="mx-auto text-5xl text-blue" />
      <h1 className="text-2xl font-extrabold text-navy">계좌 연결 완료!</h1>
      {banks.length > 0 && (
        <p className="text-sm text-gray-600">선택한 {banks.length}개 은행과의 연결이 완료되었습니다.</p>
      )}
      <button
        onClick={() => {
          const targetPath = sessionId 
            ? `/hybrid-evaluation/start/${sessionId}`
            : '/hybrid-evaluation/start';
          navigate(targetPath, { replace: true });
        }}
        className="w-full rounded-md py-3 text-white font-semibold bg-navy hover:bg-blue shadow-md transition"
      >
        신용평가로 돌아가기
      </button>
      </div>

    </>
  );
}
