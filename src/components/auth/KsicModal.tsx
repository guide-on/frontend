import React, { useCallback, useEffect, useRef, useState } from 'react';
import Pagination from '@/components/common/Pagination';
import industryApi, { type KsicItem } from '@/api/industryApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (code: string, name: string) => void;
};

const PAGE_SIZE = 10;

const KsicModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const codeRef = useRef('');
  const nameRef = useRef('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<KsicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (goPage: number = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await industryApi.search({
        code: codeRef.current.trim() || undefined,
        name: nameRef.current.trim() || undefined,
        page: goPage,
        amount: PAGE_SIZE,
      });
      setItems(res.list);
      setTotal(res.totalCount);
      setPage(res.pageNum);
      setTotalPages(res.totalPage);
    } catch (e: any) {
      setItems([]);
      setTotal(0);
      setError('업종 조회 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setPage(1);
      void fetchPage(1);
    }
  }, [open, fetchPage]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-base p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-400">
          <strong className="text-white">업종(표준산업분류코드) 선택</strong>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <input
              value={code}
              onChange={(e) => {
                const v = e.target.value;
                setCode(v);
                codeRef.current = v;
              }}
              placeholder="업종코드"
              className="min-w-0 flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg"
            />
            <input
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                nameRef.current = v;
              }}
              placeholder="업종명"
              className="min-w-0 flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg"
            />
            <button
              onClick={() => fetchPage(1)}
              className="my-0.5 px-4 next-button text-white rounded-md font-bold text-sm"
            >
              조회
            </button>
          </div>

          <p className="text-xs text-center mb-2">
            <a
              href="https://kssc.kostat.go.kr:8443/ksscNew_web/kssc/common/ClassificationContent.do?gubun=1&strCategoryNameCode=001&categoryMenu=007&addGubun=no"
              target="_blank"
              rel="noreferrer"
              className="text-blue hover:underline"
            >
              [산업분류검색 바로가기]
            </a>
            <br></br>
            <span className="text-slate-500">
              통계청의 산업분류 검색서비스를 이용하여 업종코드를 검색한 후 해당
              업종코드를 본 화면의 업종코드란에 입력하여 조회하셔도 됩니다.
            </span>
          </p>

          <div className="text-sm text-slate-600 mb-2">총 {total}건</div>
          <div className="border rounded-lg overflow-hidden">
            {/* 헤더: 실제 요소 + sticky */}
            <div className="grid grid-cols-[1fr_2fr_auto] sticky top-0 z-10 bg-slate-200">
              <div className="px-3 py-2 text-sm font-semibold text-slate-800 items-center flex justify-center">
                표준산업분류
              </div>
              <div className="px-3 py-2 text-sm font-semibold text-slate-800 items-center flex justify-center">
                업종
              </div>
              <div className="ps-3 py-2 pe-5 text-sm font-semibold text-slate-800 items-center flex justify-center">
                <div className="px-3">선택</div>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto [scrollbar-gutter:stable]">
              {/* 바디: 행마다 동일한 grid-cols 적용 */}
              {loading ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  불러오는 중...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600 text-sm">
                  {error}
                </div>
              ) : items.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  조회 결과가 없습니다
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.code}
                    className="grid grid-cols-[1fr_2fr_auto] border-t items-center"
                  >
                    <div className="px-3 py-2 text-sm text-slate-700 min-w-0 text-center font-medium">
                      {it.code}
                    </div>
                    <div className="px-3 py-2 text-sm text-slate-700 min-w-0 text-center font-medium">
                      {it.name}
                    </div>
                    <div className="px-3 py-2 text-right">
                      <button
                        onClick={() => onSelect(it.code, it.name)}
                        className="px-3 py-1 border rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        선택
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mt-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={fetchPage}
              siblingCount={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KsicModal;
