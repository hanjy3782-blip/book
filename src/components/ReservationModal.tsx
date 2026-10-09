import React, { useState, useEffect } from "react";
import type { Room, TimeSlot, ReservePayload, Reservation } from "../types";
import { formatKoreanDate, calculateMinutes, formatDuration } from "../utils/date";
import { reserve } from "../api";
import { useToast } from "../context/ToastContext";
import { X, Calendar, Clock, MapPin, Lock, ShieldAlert, Loader2, Check } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  date: string;
  selectedSlots: TimeSlot[];
  onSuccess: (reservation: Reservation) => void;
  onRefreshNeeded: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  room,
  date,
  selectedSlots,
  onSuccess,
  onRefreshNeeded,
}) => {
  const { showToast } = useToast();

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 학번/회원번호 로컬스토리지 기억 불러오기
  useEffect(() => {
    if (isOpen) {
      const savedUserId = localStorage.getItem("library_user_id") || "";
      if (savedUserId) {
        setUserId(savedUserId);
      }
    }
  }, [isOpen]);

  if (!isOpen || !room || selectedSlots.length === 0) {
    return null;
  }

  // 시작 및 종료 시간 계산
  const startTime = selectedSlots[0].start;
  const endTime = selectedSlots[selectedSlots.length - 1].end;
  const durationMinutes = calculateMinutes(startTime, endTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      showToast("이름을 입력해주세요.", "warning");
      return;
    }
    if (!userId.trim()) {
      showToast("학번(회원번호)을 입력해주세요.", "warning");
      return;
    }
    if (!pin.trim() || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      showToast("비밀번호 숫자 4자리를 정확히 입력해주세요.", "warning");
      return;
    }
    if (!agreed) {
      showToast("개인정보 수집 및 이용 수칙에 동의해주세요.", "warning");
      return;
    }

    setIsSubmitting(true);

    const payload: ReservePayload = {
      roomId: room.roomId,
      date,
      startTime,
      endTime,
      userName: userName.trim(),
      userId: userId.trim(),
      phone: phone.trim(),
      pin: pin.trim(),
    };

    try {
      const res = await reserve(payload);
      if (res.ok && res.data) {
        // 학번 로컬스토리지 저장 (비밀번호는 보안상 저장하지 않음)
        localStorage.setItem("library_user_id", userId.trim());
        showToast("예약이 성공적으로 완료되었습니다!", "success");
        onSuccess(res.data);
      } else {
        const errorMsg = res.error || "예약 처리에 실패했습니다.";
        showToast(errorMsg, "error");

        // 이미 예약된 경우 등 최신 상태 갱신 필요 시
        if (
          errorMsg.includes("이미") ||
          errorMsg.includes("예약") ||
          errorMsg.includes("마감") ||
          errorMsg.includes("중복")
        ) {
          onRefreshNeeded();
        }
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        {/* 모달 상단 헤더 */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              공간 예약 신청
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              선택한 시간과 예약자 정보를 확인해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors disabled:opacity-50"
            aria-label="모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 폼 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* 예약 요약 카드 */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{room.name}</span>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {room.type}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-800">
                {formatDuration(durationMinutes)} 이용
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-emerald-800/90 pt-1 border-t border-emerald-200/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>{formatKoreanDate(date, true)}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-emerald-900">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{startTime} ~ {endTime}</span>
              </div>
            </div>
          </div>

          {/* 입력 필드들 */}
          <div className="space-y-3.5">
            {/* 1. 이름 */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                예약자 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white"
              />
            </div>

            {/* 2. 학번 / 회원번호 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  학번 / 회원번호 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  내 예약 조회에 사용됩니다
                </span>
              </div>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="예: 20241001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white"
              />
            </div>

            {/* 3. 연락처 (선택) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                연락처 <span className="text-stone-400 font-normal">(선택)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white"
              />
            </div>

            {/* 4. 비밀번호 4자리 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-800" />
                  비밀번호 숫자 4자리 <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="숫자 4자리 입력"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white font-mono"
              />
              <p className="text-[11px] text-stone-500 mt-1 flex items-start gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span>예약 확인 및 취소 시 꼭 필요한 비밀번호이므로 기억해주세요.</span>
              </p>
            </div>

            {/* 5. 개인정보 이용 동의 */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer bg-stone-50 p-3 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer accent-emerald-800"
                />
                <div className="text-xs text-stone-600 leading-snug">
                  <span className="font-semibold text-stone-800">
                    [필수] 개인정보 수집 및 공간 이용 수칙 동의
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    도서관 공간 예약 관리 및 본인 확인 목적으로 성명, 학번, 연락처를 수집하며, 이용 목적 달성 후 안전하게 폐기됩니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 모달 하단 버튼 */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>예약 처리 중입니다... (약 2~3초 소요)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>예약 완료하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
