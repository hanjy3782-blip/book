/**
 * 도서관 공간 예약 시스템 공통 타입 정의
 */

// 도서관 설정 정보
export interface LibrarySettings {
  libraryName: string;
  notice: string;
  maxHoursPerDay: number;
  advanceDays: number;
  today: string; // YYYY-MM-DD
}

// 개별 시간 슬롯 정보
export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
  available: boolean;
  taken: boolean;
  past: boolean;
}

// 공간(스터디룸, 세미나실 등) 정보
export interface Room {
  roomId: string;
  name: string;
  type: string;
  capacity: number;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  description: string;
  slots?: TimeSlot[];
}

// 예약 정보
export interface Reservation {
  reservationId: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  userName: string;
  userId: string;
  phone?: string;
  status: "확정" | "취소";
  createdAt: string;
  cancelledAt?: string;
}

// API 기본 응답 포맷
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// init 액션 응답 데이터
export interface InitData {
  settings: LibrarySettings;
  rooms: Room[];
}

// availability 액션 응답 데이터
export interface AvailabilityData {
  date: string;
  rooms: Room[];
}

// 예약 신청 요청 바디
export interface ReservePayload {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  userId: string;
  phone?: string;
  pin: string; // 숫자 4자리
}

// 예약 취소 요청 바디
export interface CancelPayload {
  reservationId: string;
  userId?: string;
  pin?: string;
  adminKey?: string;
}

// 선택된 슬롯 범위 상태
export interface SelectedSlotRange {
  roomId: string;
  date: string;
  startSlot: TimeSlot;
  endSlot: TimeSlot;
  slots: TimeSlot[];
  durationMinutes: number;
}

// 하단 탭 종류
export type ActiveTab = "reserve" | "my" | "info" | "admin";
