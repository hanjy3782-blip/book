import React, { useState, useEffect, useTransition } from "react";
import type { Reservation } from "../types";
import { adminList, cancel } from "../api";
import { formatKoreanDate } from "../utils/date";
import { useToast } from "../context/ToastContext";
import {
  ShieldCheck,
  RotateCw,
  LogOut,
  Calendar,
  Clock,
  Search,
  AlertTriangle,
  Loader2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Key,
} from "lucide-react";

interface AdminViewProps {
  onClose: () => void;
  onRefreshAvailability?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onClose,
  onRefreshAvailability,
}) => {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // 필터 상태
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "확정" | "취소">("ALL");

  // 강제 취소 모달
  const [forceCancelTarget, setForceCancelTarget] = useState<Reservation | null>(null);
  const [isForceCancelling, setIsForceCancelling] = useState(false);

  // 세션 스토리지에서 adminKey 확인
  useEffect(() => {
    const savedKey = sessionStorage.getItem("library_admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
      fetchData(savedKey);
    }
  }, []);

  const fetchData = async (key: string, date?: string) => {
    setIsLoading(true);
    try {
      const res = await adminList(key, date || undefined);
      if (res.ok && res.data) {
        setReservations(res.data);
        setIsAuthenticated(true);
        sessionStorage.setItem("library_admin_key", key);
      } else {
        showToast(res.error || "관리자 인증 실패 또는 데이터 조회 오류", "error");
        if (!isAuthenticated) {
          sessionStorage.removeItem("library_admin_key");
        }
      }
    } catch {
      showToast("서버 통신 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      showToast("관리자 비밀번호를 입력해주세요.", "warning");
      return;
    }
    await fetchData(adminKey.trim(), filterDate);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("library_admin_key");
    setAdminKey("");
    setIsAuthenticated(false);
    setReservations([]);
    showToast("관리자 로그아웃 되었습니다.", "info");
    onClose();
  };

  const handleForceCancel = async () => {
    if (!forceCancelTarget || !adminKey) return;
    setIsForceCancelling(true);

    try {
      const res = await cancel({
        reservationId: forceCancelTarget.reservationId,
        adminKey,
      });

      if (res.ok) {
        showToast("예약이 관리자에 의해 강제 취소되었습니다.", "success");
        setForceCancelTarget(null);
        await fetchData(adminKey, filterDate);
        if (onRefreshAvailability) onRefreshAvailability();
      } else {
        showToast(res.error || "강제 취소 처리에 실패했습니다.", "error");
      }
    } catch {
      showToast("강제 취소 요청 중 통신 오류가 발생했습니다.", "error");
    } finally {
      setIsForceCancelling(false);
    }
  };

  // 통계 계산
  const totalCount = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status === "확정").length;
  const cancelledCount = reservations.filter((r) => r.status === "취소").length;

  // 필터링 적용 목록
  const filteredList = reservations.filter((item) => {
    if (filterDate && item.date !== filterDate) return false;
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (filterSearch.trim()) {
      const query = filterSearch.trim().toLowerCase();
      const matchName = item.userName?.toLowerCase().includes(query);
      const matchId = item.userId?.toLowerCase().includes(query);
      const matchRoom = item.roomName?.toLowerCase().includes(query);
      const matchPhone = item.phone?.toLowerCase().includes(query);
      return matchName || matchId || matchRoom || matchPhone;
    }
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-[480px] mx-auto space-y-4">
      {/* 1. 관리자 비밀번호 미인증 상태 */}
      {!isAuthenticated ? (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-5 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-1">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              관리자 모드 인증
            </h2>
            <p className="text-xs text-stone-500 break-keep">
              도서관 관리자 인증 키(비밀번호)를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                관리자 키 (비밀번호)
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="관리자 인증 키 입력"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>인증 중...</span>
                  </>
                ) : (
                  <span>관리자 로그인</span>
                )}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            * 관리자 키는 세션스토리지(현재 브라우저 창)에만 임시 보관됩니다.
          </p>
        </div>
      ) : (
        /* 2. 관리자 인증 완료 화면 */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 상단 관리자 타이틀 & 컨트롤 */}
          <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  도서관 관리자 대시보드
                </h3>
                <p className="text-[11px] text-stone-400">
                  전체 예약 모니터링 & 강제 취소
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchData(adminKey, filterDate)}
                disabled={isLoading}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs active:scale-95 transition-all"
                title="새로고침"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all border border-rose-800/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>종료</span>
              </button>
            </div>
          </div>

          {/* 예약 현황 요약 통계 카드 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs text-center">
              <span className="text-[11px] text-stone-500 font-medium block">
                총 예약
              </span>
              <span className="text-lg font-bold text-stone-900 mt-0.5 block">
                {totalCount}건
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-200/80 shadow-xs text-center bg-emerald-50/30">
              <span className="text-[11px] text-emerald-700 font-medium block">
                확정 건수
              </span>
              <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
                {confirmedCount}건
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-rose-200/80 shadow-xs text-center bg-rose-50/30">
              <span className="text-[11px] text-rose-700 font-medium block">
                취소 건수
              </span>
              <span className="text-lg font-bold text-rose-700 mt-0.5 block">
                {cancelledCount}건
              </span>
            </div>
          </div>

          {/* 검색 및 필터 옵션 바 */}
          <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2.5">
            {/* 검색어 입력 */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  startTransition(() => {
                    setFilterSearch(val);
                  });
                }}
                placeholder="이름, 학번, 공간명, 전화번호 검색"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-stone-50"
              />
            </div>

            {/* 날짜 필터 및 상태 필터 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    const d = e.target.value;
                    setFilterDate(d);
                    fetchData(adminKey, d);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none"
                />
              </div>

              {filterDate && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDate("");
                    fetchData(adminKey);
                  }}
                  className="text-[11px] text-stone-500 hover:text-stone-800 px-2 py-1 bg-stone-100 rounded-md"
                >
                  날짜 해제
                </button>
              )}

              {/* 상태 필터 탭 */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
                {(["ALL", "확정", "취소"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      filterStatus === st
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {st === "ALL" ? "전체" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 전체 예약 리스트 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                조회 결과 ({filteredList.length}건)
              </span>
            </div>

            {filteredList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center text-stone-400 text-xs">
                해당 조건의 예약 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredList.map((item) => {
                  const isConfirmed = item.status === "확정";
                  return (
                    <div
                      key={item.reservationId}
                      className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-3.5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900">
                              {item.roomName}
                            </span>
                            {isConfirmed ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                확정
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                                <XCircle className="w-3 h-3" />
                                취소됨
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                            {item.reservationId}
                          </p>
                        </div>

                        {/* 강제 취소 버튼 (확정 건만) */}
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => setForceCancelTarget(item)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>강제 취소</span>
                          </button>
                        )}
                      </div>

                      {/* 예약 상세 정보 */}
                      <div className="bg-stone-50 rounded-xl p-2.5 text-xs text-stone-700 grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="font-medium">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="font-bold text-stone-900">
                            {item.startTime} ~ {item.endTime}
                          </span>
                        </div>
                        <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] pt-1 border-t border-stone-200/60 text-stone-600">
                          <span className="font-semibold text-stone-900">
                            {item.userName}
                          </span>
                          <span className="text-stone-400 font-mono">({item.userId})</span>
                          {item.phone && (
                            <span className="text-stone-500">· {item.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 관리자 강제 취소 확인 모달 */}
      {forceCancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white w-full max-w-[380px] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                관리자 권한 강제 취소
              </h3>
              <p className="text-xs text-stone-500 break-keep leading-relaxed">
                해당 예약을 강제로 취소하시겠습니까? 취소된 시간은 즉시 빈 슬롯으로 복구됩니다.
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1 text-stone-700">
              <p className="font-bold text-stone-900">{forceCancelTarget.roomName}</p>
              <p>
                {formatKoreanDate(forceCancelTarget.date)} {forceCancelTarget.startTime} ~ {forceCancelTarget.endTime}
              </p>
              <p className="text-[11px] text-stone-500">
                예약자: {forceCancelTarget.userName} ({forceCancelTarget.userId})
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForceCancelTarget(null)}
                disabled={isForceCancelling}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleForceCancel}
                disabled={isForceCancelling}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isForceCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>취소 중...</span>
                  </>
                ) : (
                  <span>강제 취소 실행</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
