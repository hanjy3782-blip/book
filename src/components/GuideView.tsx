import React from "react";
import type { LibrarySettings } from "../types";
import {
  Clock,
  Calendar,
  ShieldCheck,
  Coffee,
  Volume2,
  Trash2,
  HelpCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface GuideViewProps {
  settings: LibrarySettings | null;
}

export const GuideView: React.FC<GuideViewProps> = ({ settings }) => {
  const maxHours = settings?.maxHoursPerDay || 2;
  const advanceDays = settings?.advanceDays || 7;
  const libraryName = settings?.libraryName || "도서관";

  return (
    <div className="pb-24 pt-4 px-4 max-w-[480px] mx-auto space-y-4">
      {/* 헤더 배너 */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>공간 이용 수칙 & 운영 규정</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight">
          {libraryName} 이용 안내
        </h2>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          쾌적하고 공정한 학습 환경 조성을 위해 아래 운영 규칙을 준수해 주시기 바랍니다.
        </p>
      </div>

      {/* 핵심 운영 규칙 카드 (settings 기반) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 space-y-3.5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>예약 운영 기준</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 1일 최대 시간 */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>1일 최대 이용</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              최대 {maxHours}시간
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">
              1인 1일 기준 연속/분할 포함
            </p>
          </div>

          {/* 사전 예약 가능 기간 */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>예약 가능 기간</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {advanceDays}일 전부터
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">
              오늘 기준 최대 {advanceDays}일간 오픈
            </p>
          </div>
        </div>

        {/* 예약 취소 및 변경 안내 */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
          <div className="font-bold flex items-center gap-1 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>예약 확인 및 간편 취소</span>
          </div>
          <p className="text-[11px] text-emerald-900/90 leading-relaxed">
            일정 변경 시 <strong>[내 예약]</strong> 메뉴에서 등록하신 학번과 4자리 비밀번호로 즉시 취소하실 수 있습니다. 이용하지 않을 경우 다른 학우를 위해 미리 취소해주세요.
          </p>
        </div>
      </div>

      {/* 공간 이용 준수 수칙 */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-bold text-stone-900">
          이용자 준수 수칙
        </h3>

        <div className="space-y-2.5 text-xs text-stone-700">
          <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-stone-50 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-stone-900">정시 입·퇴실 준수</span>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                다음 예약자를 위해 이용 종료 5분 전 정리 및 퇴실을 완료해주세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-stone-50 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
              <Coffee className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-stone-900">음식물 반입 제한</span>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                생수 및 뚜껑이 닫히는 음료(텀블러) 외 패스트푸드, 배달 음식 등은 반입이 불가합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-stone-50 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-stone-900">방음 및 정숙 유지</span>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                공용 열람실 및 복도에 소음이 나가지 않도록 출입문을 꼭 닫고 이용해주세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-stone-50 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-stone-900">시설 원상 복구 및 쓰레기 분리배출</span>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                화이트보드 지우기, 책상 정돈, 전등 및 냉난방기 전원을 끄고 퇴실해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 문의 및 도움말 */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-xs text-stone-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <HelpCircle className="w-4 h-4 text-stone-500" />
          <span>도서관 안내 데스크</span>
        </div>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          예약 시스템 오류 문의 또는 분실물 관련 안내는 도서관 1층 통합 안내데스크로 문의해 주세요.
        </p>
      </div>
    </div>
  );
};
