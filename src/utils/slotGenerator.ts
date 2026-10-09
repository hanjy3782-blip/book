/**
 * 방 운영 시간 및 slotMinutes(30분/60분 등) 기준 슬롯 자동 생성 유틸리티
 */
import type { TimeSlot, Room } from "../types";
import { getTodayYMD } from "./date";

export function generateSlotsForRoom(room: Room, dateYMD: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openH, openM] = room.openTime.split(":").map(Number);
  const [closeH, closeM] = room.closeTime.split(":").map(Number);
  const slotMins = room.slotMinutes || 60;

  const totalOpenMinutes = openH * 60 + openM;
  const totalCloseMinutes = closeH * 60 + closeM;

  const now = new Date();
  const todayStr = getTodayYMD();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  let cur = totalOpenMinutes;
  while (cur + slotMins <= totalCloseMinutes) {
    const startH = Math.floor(cur / 60);
    const startM = cur % 60;
    const endH = Math.floor((cur + slotMins) / 60);
    const endM = (cur + slotMins) % 60;

    const start = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
    const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    const isPast = dateYMD < todayStr || (dateYMD === todayStr && cur < currentTotalMinutes);

    slots.push({
      start,
      end,
      available: !isPast,
      taken: false,
      past: isPast,
    });

    cur += slotMins;
  }

  return slots;
}
