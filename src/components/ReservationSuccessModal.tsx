import React, { useState } from "react";
import type { Reservation } from "../types";
import { formatKoreanDate } from "../utils/date";
import { CheckCircle2, Copy, Check, Calendar, Clock, MapPin, User, Hash, AlertCircle } from "lucide-react";

interface ReservationSuccessModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const ReservationSuccessModal: React.FC<ReservationSuccessModalProps> = ({
  reservation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!reservation) return null;

  const handleCopyId = () => {
    if (reservation.reservationId) {
      navigator.clipboard.writeText(reservation.reservationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white w-full max-w-[440px] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 animate-in zoom-in-95 duration-200 text-stone-900">
        {/* 상단 축하 아이콘 */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            예약이 확정되었습니다!
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            도서관 공간 예약이 정상적으로 접수되었습니다.
          </p>
        </div>

        {/* 예약 번호 박스 */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 block">
              예약 번호
            </span>
            <span className="text-sm font-mono font-bold text-stone-800">
              {reservation.reservationId || "예약 접수완료"}
            </span>
          </div>
          {reservation.reservationId && (
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-700">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 예약 상세 정보 */}
        <div className="space-y-2.5 bg-stone-50/60 rounded-2xl p-4 border border-stone-100 text-xs text-stone-700 mb-4">
          <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              이용 공간
            </span>
            <span className="font-bold text-stone-900">{reservation.roomName}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              예약 일자
            </span>
            <span className="font-semibold text-stone-800">
              {formatKoreanDate(reservation.date, true)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              이용 시간
            </span>
            <span className="font-bold text-emerald-800">
              {reservation.startTime} ~ {reservation.endTime}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-stone-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              예약자 (학번)
            </span>
            <span className="font-medium text-stone-800">
              {reservation.userName} ({reservation.userId})
            </span>
          </div>
        </div>

        {/* 유의사항 안내 */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 mb-5 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold">예약 취소 및 조회 안내</p>
            <p className="text-amber-800/90 mt-0.5">
              하단 <strong>[내 예약]</strong> 메뉴에서 등록하신 학번과 4자리 비밀번호로 언제든 예약을 조회하거나 취소하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* 확인 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm shadow-md transition-all text-center"
        >
          확인 (현황 새로고침)
        </button>
      </div>
    </div>
  );
};
