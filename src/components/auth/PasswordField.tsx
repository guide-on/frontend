// src/components/auth/PasswordField.tsx
import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  value: string; // 부모 state의 비밀번호
  onChange: (next: string) => void; // 비밀번호 변경 알림
  onValidated?: (ok: boolean) => void; // 유효성 + 일치 여부 통과시 true
};

type Validation = {
  length: boolean;
  lowercase: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
  combination: boolean;
};

const initialValidation: Validation = {
  length: false,
  lowercase: false,
  upper: false,
  number: false,
  special: false,
  combination: false,
};

function validatePassword(value: string): Validation {
  const length = value.length >= 8 && value.length <= 20;
  const lowercase = /[a-z]/.test(value);
  const upper = /[A-Z]/.test(value);
  const number = /[0-9]/.test(value);
  const special = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  // 영문(대/소문자 중 하나 이상) + 숫자 + 특수문자 중 3가지 이상
  const types = [lowercase || upper, number, special].filter(Boolean).length;
  const combination = types >= 3;

  return { length, lowercase, upper, number, special, combination };
}

const PasswordField: React.FC<Props> = ({ value, onChange, onValidated }) => {
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [validation, setValidation] = useState<Validation>(initialValidation);

  const isValid = useMemo(
    () => validation.length && validation.combination,
    [validation],
  );

  const isMatched = useMemo(() => value === password2, [value, password2]);

  // 입력 변경마다 검증 업데이트
  useEffect(() => {
    setValidation(validatePassword(value));
  }, [value]);

  // 부모에게 최종 유효 여부 알려주기
  useEffect(() => {
    onValidated?.(isValid && isMatched);
  }, [isValid, isMatched, onValidated]);

  return (
    <div className="space-y-4">
      {/* 비밀번호 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
          비밀번호
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="비밀번호"
            required
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i
              className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'} w-5 h-5`}
            />
          </button>
        </div>

        {/* 요건 안내 */}
        {value && !isValid && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-1">
              {(
                [
                  ['length', '8자 이상, 20자 이하'],
                  ['special', '특수문자 포함'],
                  ['number', '숫자 포함'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1">
                  <i
                    className={`fa-regular fa-circle-check text-base align-middle ${
                      validation[key] ? 'text-green-400' : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      validation[key] ? 'text-green-400' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}

              {/* 영문 포함(대/소문자 중 하나 이상) */}
              <div className="flex items-center gap-1">
                <i
                  className={`fa-regular fa-circle-check text-base align-middle ${
                    validation.lowercase || validation.upper
                      ? 'text-green-400'
                      : 'text-slate-500'
                  }`}
                />
                <span
                  className={`text-sm ${
                    validation.lowercase || validation.upper
                      ? 'text-green-400'
                      : 'text-slate-500'
                  }`}
                >
                  영문 포함(한글 제외)
                </span>
              </div>
            </div>
          </div>
        )}

        {value && !isValid && (
          <p className="flex text-sm text-red-600 mt-2 ms-1">
            비밀번호를 확인해주세요
          </p>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ps-1">
          비밀번호 확인
        </label>
        <div className="relative">
          <input
            type={showPassword2 ? 'text' : 'password'}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="비밀번호 확인"
            required
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 text-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword2((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i
              className={`fa-solid ${showPassword2 ? 'fa-eye' : 'fa-eye-slash'} w-5 h-5`}
            />
          </button>
        </div>

        {password2 && !isMatched && (
          <p className="flex text-sm text-red-600 mt-1 ms-1">
            비밀번호가 일치하지 않습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default PasswordField;
