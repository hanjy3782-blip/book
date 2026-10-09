import React, { useState, useRef } from "react";
import { BookOpen, Megaphone, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

interface HeaderProps {
  libraryName: string;
  notice?: string;
  onUnlockAdmin: () => void;
  isAdminActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  libraryName,
  notice,
  onUnlockAdmin,
  isAdminActive,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 상단 도서관 이름 5번 연속 탭 시 관리자 진입
  const handleTitleTap = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextCount = tapCount + 1;
    if (nextCount >= 5) {
      setTapCount(0);
      onUnlockAdmin();
      return;
    }

    setTapCount(nextCount);

    // 2.5초 내에 다음 탭이 없으면 카운트 초기화
    timerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2500);
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-md border-b border-emerald-950/40">
      <div className="max-w-[480px] mx-auto px-4 py-3.5 flex items-center justify-between select-none">
        <div
          onClick={handleTitleTap}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          title="도서관 공간 예약 시스템"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-800/90 border border-emerald-600/40 flex items-center justify-center text-emerald-200 shadow-inner">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              {libraryName || "도서관 공간 예약"}
              {isAdminActive && (
                <span className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  관리자
                </span>
              )}
            </h1>
            <p className="text-[11px] text-emerald-200/80 font-normal">
              스터디룸 · 세미나실 실시간 예약
            </p>
          </div>
        </div>

        {/* 탭 카운트 시각적 피드백 (3회 이상 탭 시) */}
        {tapCount >= 2 && tapCount < 5 && (
          <div className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full animate-pulse border border-emerald-700/50">
            {5 - tapCount}회 더 터치 시 관리자
          </div>
        )}
      </div>

      {/* 공지사항 배너 */}
      {notice && (
        <div className="bg-emerald-950/90 border-t border-emerald-800/50 text-emerald-100 text-xs px-4 py-2">
          <div className="max-w-[480px] mx-auto">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div
                  className={`leading-relaxed break-keep ${
                    isNoticeExpanded ? "" : "truncate"
                  }`}
                >
                  <span className="font-semibold text-amber-300 mr-1.5">[공지]</span>
                  {notice}
                </div>
              </div>
              {notice.length > 35 && (
                <button
                  type="button"
                  onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
                  className="text-emerald-300/80 hover:text-white p-0.5 shrink-0 transition-colors"
                  aria-label="공지사항 토글"
                >
                  {isNoticeExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
