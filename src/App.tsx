/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Room, TimeSlot, LibrarySettings, Reservation, ActiveTab } from "./types";
import { init, availability } from "./api";
import { getTodayYMD, formatKoreanDate, calculateMinutes, formatDuration } from "./utils/date";
import { DEFAULT_SETTINGS, DEFAULT_ROOMS } from "./constants/initialData";
import { generateSlotsForRoom } from "./utils/slotGenerator";
import { ToastProvider, useToast } from "./context/ToastContext";
import { Header } from "./components/Header";
import { DateSelector } from "./components/DateSelector";
import { RoomCard } from "./components/RoomCard";
import { ReservationModal } from "./components/ReservationModal";
import { ReservationSuccessModal } from "./components/ReservationSuccessModal";
import { MyReservationsView } from "./components/MyReservationsView";
import { GuideView } from "./components/GuideView";
import { AdminView } from "./components/AdminView";
import { BottomNav } from "./components/BottomNav";
import {
  RotateCw,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function MainApp() {
  const { showToast } = useToast();

  const todayStr = getTodayYMD();

  // 구글 시트 기본값 반영 초기 상태
  const [settings, setSettings] = useState<LibrarySettings>(DEFAULT_SETTINGS);
  const [rooms, setRooms] = useState<Room[]>(() =>
    DEFAULT_ROOMS.map((r) => ({
      ...r,
      slots: generateSlotsForRoom(r, todayStr),
    }))
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("전체");

  // 선택된 공간 및 슬롯 상태
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  // 화면 탭 및 모달
  const [activeTab, setActiveTab] = useState<ActiveTab>("reserve");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);

  // 로딩 상태
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // 관리자 모드 활성화 여부
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return !!sessionStorage.getItem("library_admin_key");
  });

  // 1. 초기 데이터 로드 (앱 최초 마운트 시 1회 실행)
  const loadInitialData = useCallback(async () => {
    setIsInitializing(true);

    try {
      const res = await init();
      if (res.ok && res.data) {
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
        if (res.data.rooms && res.data.rooms.length > 0) {
          setRooms(res.data.rooms);
        }
        const initialDate = res.data.settings?.today || todayStr;
        setSelectedDate(initialDate);
        await loadAvailability(initialDate);
      } else {
        // 서버에서 아직 응답이 없거나 배포 권한 설정 전인 경우
        // 기본 시트 정보로 슬롯 생성 유지
        setRooms((prev) =>
          prev.map((r) => ({
            ...r,
            slots: r.slots || generateSlotsForRoom(r, todayStr),
          }))
        );
      }
    } catch {
      // 네트워크 지연 시에도 시트 기반 화면 유지
    } finally {
      setIsInitializing(false);
    }
  }, [todayStr]);

  // 2. 특정 날짜 시간 슬롯 현황 로드
  const loadAvailability = useCallback(async (date: string) => {
    setIsLoadingAvailability(true);
    try {
      const res = await availability(date);
      if (res.ok && res.data && res.data.rooms) {
        setRooms(res.data.rooms);
      } else {
        // 서버 슬롯 미응답 시 시트 스펙(slotMinutes: 60분/30분 등) 기반 슬롯 제공
        setRooms((prev) =>
          prev.map((r) => ({
            ...r,
            slots: generateSlotsForRoom(r, date),
          }))
        );
      }
    } catch {
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          slots: generateSlotsForRoom(r, date),
        }))
      );
    } finally {
      setIsLoadingAvailability(false);
    }
  }, []);

  // 최초 마운트 시 1회만 초기화 실행
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 날짜 변경 핸들러
  const handleSelectDate = (newDate: string) => {
    if (newDate === selectedDate) return;
    setSelectedDate(newDate);
    // 날짜가 바뀌면 선택했던 슬롯 초기화
    setSelectedRoom(null);
    setSelectedSlots([]);
    loadAvailability(newDate);
  };

  // 공간 유형 목록 추출 (중복 제거)
  const roomTypes = useMemo(() => {
    const types = Array.from(new Set(rooms.map((r) => r.type).filter(Boolean)));
    return ["전체", ...types];
  }, [rooms]);

  // 공간 유형 필터 적용된 목록
  const filteredRooms = useMemo(() => {
    if (selectedRoomType === "전체") return rooms;
    return rooms.filter((r) => r.type === selectedRoomType);
  }, [rooms, selectedRoomType]);

  // 슬롯 클릭 처리 (단일/연속 범위 선택 로직)
  const handleSlotClick = (room: Room, clickedSlot: TimeSlot, allSlots: TimeSlot[]) => {
    // 다른 공간의 슬롯을 클릭한 경우 새 공간으로 교체
    if (!selectedRoom || selectedRoom.roomId !== room.roomId) {
      setSelectedRoom(room);
      setSelectedSlots([clickedSlot]);
      return;
    }

    // 동일 공간 내 클릭:
    // 1) 이미 선택된 단일 슬롯을 다시 클릭한 경우 -> 선택 해제
    if (selectedSlots.length === 1 && selectedSlots[0].start === clickedSlot.start) {
      setSelectedRoom(null);
      setSelectedSlots([]);
      return;
    }

    // 2) 범위 선택 시작
    const currentStartSlot = selectedSlots[0];
    const startIndex = allSlots.findIndex((s) => s.start === currentStartSlot.start);
    const clickedIndex = allSlots.findIndex((s) => s.start === clickedSlot.start);

    // 이전 시간대를 클릭했거나 이미 여러 개 선택된 상태에서 클릭한 경우 -> 시작점을 재설정
    if (clickedIndex < startIndex || selectedSlots.length > 1) {
      setSelectedSlots([clickedSlot]);
      return;
    }

    // startIndex부터 clickedIndex까지 연속 범위 검사
    const targetRange = allSlots.slice(startIndex, clickedIndex + 1);

    // 중간에 예약 불가/지난 시간/마감 슬롯이 있는지 체크
    const hasUnavailable = targetRange.some((s) => s.taken || s.past || !s.available);
    if (hasUnavailable) {
      showToast("중간에 예약 불가능한 시간이 포함되어 있어 연속 선택할 수 없습니다.", "warning");
      return;
    }

    // 1일 최대 이용 가능 시간 체크
    const first = targetRange[0];
    const last = targetRange[targetRange.length - 1];
    const totalMinutes = calculateMinutes(first.start, last.end);
    const maxMinutes = (settings?.maxHoursPerDay || 2) * 60;

    if (totalMinutes > maxMinutes) {
      showToast(`1일 최대 이용 가능 시간(${settings?.maxHoursPerDay || 2}시간)을 초과할 수 없습니다.`, "warning");
      return;
    }

    // 정상 범위 선택 완료
    setSelectedSlots(targetRange);
  };

  // 예약 성공 처리
  const handleReservationSuccess = (resData: Reservation) => {
    setIsReservationModalOpen(false);
    setSelectedRoom(null);
    setSelectedSlots([]);
    setCompletedReservation(resData);
  };

  // 완료 모달 닫기 및 현황 갱신
  const handleCloseSuccessModal = () => {
    setCompletedReservation(null);
    loadAvailability(selectedDate);
  };

  // 관리자 모드 열기 (헤더 5회 탭 시)
  const handleUnlockAdmin = () => {
    setIsAdminUnlocked(true);
    setActiveTab("admin");
    showToast("관리자 메뉴로 전환되었습니다.", "info");
  };

  // 선택된 총 시간 계산
  const selectedDurationMinutes =
    selectedSlots.length > 0
      ? calculateMinutes(selectedSlots[0].start, selectedSlots[selectedSlots.length - 1].end)
      : 0;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex justify-center selection:bg-emerald-800 selection:text-white">
      {/* 모바일 우선 최대 480px 컨테이너 */}
      <div className="w-full max-w-[480px] bg-stone-50 min-h-screen flex flex-col shadow-2xl relative border-x border-stone-200">
        {/* 상단 공통 헤더 */}
        <Header
          libraryName={settings?.libraryName || "도서관 공간 예약"}
          notice={settings?.notice}
          onUnlockAdmin={handleUnlockAdmin}
          isAdminActive={isAdminUnlocked}
        />

        {/* 탭 1: 예약하기 (메인) */}
        {activeTab === "reserve" && (
          <main className="flex-1 pb-32">
            {/* 날짜 선택 가로 스크롤 칩 바 */}
            <DateSelector
              startDate={settings?.today || getTodayYMD()}
              advanceDays={settings?.advanceDays || 7}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />

            {/* 필터 및 현황 상단 바 */}
            <div className="px-4 pt-3.5 pb-2">
              {/* 공간 유형 필터 칩 */}
              {roomTypes.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <div className="flex items-center gap-1 text-xs text-stone-400 mr-1 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                    <span>분류</span>
                  </div>
                  {roomTypes.map((type) => {
                    const isSelected = selectedRoomType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedRoomType(type)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                          isSelected
                            ? "bg-emerald-800 text-white shadow-xs font-semibold"
                            : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 안내 및 새로고침 버튼 */}
              <div className="flex items-center justify-between text-xs text-stone-500 mt-2 px-0.5">
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>예약 가능 공간 ({filteredRooms.length}개)</span>
                </span>
                <button
                  type="button"
                  onClick={() => loadAvailability(selectedDate)}
                  disabled={isLoadingAvailability}
                  className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-emerald-800 transition-colors p-1"
                >
                  <RotateCw
                    className={`w-3 h-3 ${isLoadingAvailability ? "animate-spin text-emerald-800" : ""}`}
                  />
                  <span>새로고침</span>
                </button>
              </div>
            </div>

            {/* 공간 카드 목록 영역 */}
            <div className="px-4 space-y-3 mt-1">
              {/* 로딩 스켈레톤 */}
              {isInitializing || isLoadingAvailability ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-5 w-28 bg-stone-200 rounded-md" />
                          <div className="h-3 w-40 bg-stone-100 rounded-md" />
                        </div>
                        <div className="h-5 w-16 bg-stone-200 rounded-md" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => (
                          <div key={slotIdx} className="h-10 bg-stone-100 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-10 text-center text-stone-400 text-xs">
                  해당 조건에 일치하는 공간이 없습니다.
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isCurrentRoomSelected = selectedRoom?.roomId === room.roomId;
                  const roomSelectedSlots = isCurrentRoomSelected ? selectedSlots : [];

                  return (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      selectedSlots={roomSelectedSlots}
                      onSlotClick={handleSlotClick}
                    />
                  );
                })
              )}
            </div>

            {/* 하단 고정 예약 신청 바 */}
            {selectedRoom && selectedSlots.length > 0 && (
              <aside aria-label="선택된 예약 정보" className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-900/10 shadow-2xl animate-in slide-in-from-bottom-4">
                <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 truncate">
                      <span className="truncate">{selectedRoom.name}</span>
                      <span className="text-[11px] text-emerald-800 font-semibold px-1.5 py-0.2 rounded bg-emerald-100/80">
                        {formatDuration(selectedDurationMinutes)}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{formatKoreanDate(selectedDate)}</span>
                      <span className="font-semibold text-emerald-900 ml-0.5">
                        {selectedSlots[0].start} ~ {selectedSlots[selectedSlots.length - 1].end}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReservationModalOpen(true)}
                    className="py-3 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    <span>예약하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </aside>
            )}
          </main>
        )}

        {/* 탭 2: 내 예약 */}
        {activeTab === "my" && (
          <main className="flex-1">
            <MyReservationsView
              onRefreshAvailability={() => loadAvailability(selectedDate)}
            />
          </main>
        )}

        {/* 탭 3: 이용 안내 */}
        {activeTab === "info" && (
          <main className="flex-1">
            <GuideView settings={settings} />
          </main>
        )}

        {/* 탭 4: 관리자 모드 (숨김 메뉴) */}
        {activeTab === "admin" && (
          <main className="flex-1">
            <AdminView
              onClose={() => setActiveTab("reserve")}
              onRefreshAvailability={() => loadAvailability(selectedDate)}
            />
          </main>
        )}

        {/* 예약 정보 입력 폼 모달 */}
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          room={selectedRoom}
          date={selectedDate}
          selectedSlots={selectedSlots}
          onSuccess={handleReservationSuccess}
          onRefreshNeeded={() => loadAvailability(selectedDate)}
        />

        {/* 예약 완료 결과 모달 */}
        <ReservationSuccessModal
          reservation={completedReservation}
          onClose={handleCloseSuccessModal}
        />

        {/* 하단 공통 탭 바 */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          isAdminActive={isAdminUnlocked}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
