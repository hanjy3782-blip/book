import React, { useState, useEffect } from "react";
import type { Reservation } from "../types";
import { myReservations, cancel } from "../api";
import { formatKoreanDate } from "../utils/date";
import { useToast } from "../context/ToastContext";
import {
  Calendar,
  Clock,
  MapPin,
  Lock,
  User,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  History,
  Trash2,
  Search,
} from "lucide-react";

interface MyReservationsViewProps {
  onRefreshAvailability?: () => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  onRefreshAvailability,
}) => {
  const { showToast } = useToast();

  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [rememberedUserId, setRememberedUserId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // 취소 확인 모달 상태
  const [cancellingItem, setCancellingItem] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // 로컬스토리지에서 저장된 학번 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("library_user_id") || "";
    if (saved) {
      setUserId(saved);
      setRememberedUserId(saved);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!userId.trim()) {
      showToast("학번(회원번호)을 입력해주세요.", "warning");
      return;
    }
    if (!pin.trim() || pin.length !== 4) {
      showToast("비밀번호 숫자 4자리를 입력해주세요.", "warning");
      return;
    }

    setIsSearching(true);
    try {
      const res = await myReservations(userId.trim(), pin.trim());
      if (res.ok && res.data) {
        // 학번만 로컬스토리지에 저장 (비밀번호는 절대 저장 안 함)
        localStorage.setItem("library_user_id", userId.trim());
        setRememberedUserId(userId.trim());
        setReservations(res.data);
        setHasSearched(true);
        if (res.data.length === 0) {
          showToast("조회된 예약 내역이 없습니다.", "info");
        }
      } else {
        showToast(res.error || "예약 내역을 조회할 수 없습니다.", "error");
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // 새로고침
  const handleReload = async () => {
    if (!userId || !pin) return;
    setIsSearching(true);
    try {
      const res = await myReservations(userId.trim(), pin.trim());
      if (res.ok && res.data) {
        setReservations(res.data);
        showToast("예약 내역을 새로고침했습니다.", "success");
      } else {
        showToast(res.error || "새로고침 실패", "error");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 예약 취소 실행
  const confirmCancel = async () => {
    if (!cancellingItem) return;

    setIsCancelling(true);
    try {
      const res = await cancel({
        reservationId: cancellingItem.reservationId,
        userId: userId.trim(),
        pin: pin.trim(),
      });

      if (res.ok) {
        showToast("예약이 정상적으로 취소되었습니다.", "success");
        setCancellingItem(null);
        // 내 예약 목록 갱신
        const updated = await myReservations(userId.trim(), pin.trim());
        if (updated.ok && updated.data) {
          setReservations(updated.data);
        }
        // 메인 예약 현황도 갱신 유도
        if (onRefreshAvailability) {
          onRefreshAvailability();
        }
      } else {
        showToast(res.error || "예약 취소에 실패했습니다.", "error");
      }
    } catch {
      showToast("예약 취소 요청 중 통신 오류가 발생했습니다.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // 다른 번호로 조회 시 리셋
  const handleResetSearch = () => {
    setHasSearched(false);
    setPin("");
    setReservations([]);
  };

  // 현재 시간 기준 구분 (다가오는 예약 vs 지난·취소 예약)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const upcomingReservations: Reservation[] = [];
  const pastOrCancelledReservations: Reservation[] = [];

  reservations.forEach((item) => {
    if (item.status === "취소") {
      pastOrCancelledReservations.push(item);
    } else {
      // 확정 상태인 경우
      const isFutureDate = item.date > todayStr;
      const isTodayFuture = item.date === todayStr && item.endTime >= currentTimeStr;
      if (isFutureDate || isTodayFuture) {
        upcomingReservations.push(item);
      } else {
        pastOrCancelledReservations.push(item);
      }
    }
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-[480px] mx-auto space-y-5">
      {/* 1. 조회 입력 폼 (조회 전) */}
      {!hasSearched ? (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              내 예약 내역 조회
            </h2>
            <p className="text-xs text-stone-500 break-keep">
              예약 시 입력했던 학번(회원번호)과 4자리 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                학번 / 회원번호
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="예: 20241001"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                비밀번호 숫자 4자리
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="숫자 4자리"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>조회 중입니다...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>예약 내역 조회</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            * 학번은 브라우저에 안전하게 기억되나, 비밀번호는 보안을 위해 저장되지 않습니다.
          </p>
        </div>
      ) : (
        /* 2. 조회 결과 화면 */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 상단 회원 정보 바 */}
          <div className="bg-emerald-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] text-emerald-200/90 font-medium">
                조회된 학번
              </span>
              <h3 className="text-base font-bold tracking-tight">
                {userId} 님
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReload}
                disabled={isSearching}
                className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                title="새로고침"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin" : ""}`} />
                <span>새로고침</span>
              </button>
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-2.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 text-xs font-medium active:scale-95 transition-all"
              >
                다른 번호 조회
              </button>
            </div>
          </div>

          {/* 다가오는 예약 섹션 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-800" />
                <span>다가오는 예약</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {upcomingReservations.length}
                </span>
              </h3>
            </div>

            {upcomingReservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center text-stone-400 text-xs space-y-1">
                <p className="font-medium text-stone-600">다가오는 예약이 없습니다.</p>
                <p className="text-[11px]">필요한 스터디룸이나 세미나실을 예약해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((item) => (
                  <div
                    key={item.reservationId}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 hover:border-emerald-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-stone-900">
                            {item.roomName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            확정됨
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                          예약번호: {item.reservationId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCancellingItem(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>예약 취소</span>
                      </button>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1.5 text-stone-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="font-semibold text-stone-900">
                          {formatKoreanDate(item.date, true)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="font-bold text-emerald-900">
                          {item.startTime} ~ {item.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-500 text-[11px] pt-0.5 border-t border-stone-200/60">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>예약자: {item.userName}</span>
                        {item.phone && <span>· {item.phone}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 지난 및 취소된 예약 섹션 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-stone-600 flex items-center gap-1.5">
                <History className="w-4 h-4 text-stone-500" />
                <span>지난 · 취소된 예약</span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {pastOrCancelledReservations.length}
                </span>
              </h3>
            </div>

            {pastOrCancelledReservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center text-stone-400 text-xs">
                지난 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pastOrCancelledReservations.map((item) => {
                  const isCancelled = item.status === "취소";
                  return (
                    <div
                      key={item.reservationId}
                      className="bg-white rounded-xl border border-stone-200/70 p-3.5 opacity-80 hover:opacity-100 transition-opacity space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-700">
                            {item.roomName}
                          </span>
                          {isCancelled ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              취소됨
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              이용 완료
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-stone-400">
                          {item.reservationId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>
                          {formatKoreanDate(item.date)} ({item.startTime}~{item.endTime})
                        </span>
                        <span>{item.userName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 예약 취소 확인 모달 */}
      {cancellingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white w-full max-w-[380px] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                예약을 취소하시겠습니까?
              </h3>
              <p className="text-xs text-stone-500 break-keep leading-relaxed">
                취소 즉시 해당 시간은 다른 이용자가 예약할 수 있게 반환되며, 되돌릴 수 없습니다.
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1 text-stone-700">
              <p className="font-bold text-stone-900">{cancellingItem.roomName}</p>
              <p>
                {formatKoreanDate(cancellingItem.date)} {cancellingItem.startTime} ~ {cancellingItem.endTime}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingItem(null)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>취소 중...</span>
                  </>
                ) : (
                  <span>취소 확정</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
