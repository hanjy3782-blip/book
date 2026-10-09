import type { LibrarySettings, Room } from "../types";
import { getTodayYMD } from "../utils/date";

export const DEFAULT_SETTINGS: LibrarySettings = {
  libraryName: "우리 도서관",
  maxHoursPerDay: 3,
  advanceDays: 7,
  notice: "예약 시간 10분 경과 시 예약이 자동 취소될 수 있습니다.",
  today: getTodayYMD(),
};

export const DEFAULT_ROOMS: Room[] = [
  {
    roomId: "S1",
    name: "스터디룸 1",
    type: "스터디룸",
    capacity: 4,
    openTime: "09:00",
    closeTime: "21:00",
    slotMinutes: 60,
    description: "4인용 · 화이트보드",
  },
  {
    roomId: "S2",
    name: "스터디룸 2",
    type: "스터디룸",
    capacity: 6,
    openTime: "09:00",
    closeTime: "21:00",
    slotMinutes: 60,
    description: "6인용 · 대형 모니터",
  },
  {
    roomId: "G1",
    name: "세미나실",
    type: "세미나실",
    capacity: 12,
    openTime: "09:00",
    closeTime: "18:00",
    slotMinutes: 60,
    description: "12인용 · 빔프로젝터",
  },
  {
    roomId: "M1",
    name: "멀티미디어실",
    type: "멀티미디어",
    capacity: 2,
    openTime: "09:00",
    closeTime: "18:00",
    slotMinutes: 30,
    description: "PC 2대 · 영상 편집",
  },
];
