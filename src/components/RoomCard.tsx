import React from "react";
import type { Room, TimeSlot } from "../types";
import { Users, Clock, Info } from "lucide-react";

interface RoomCardProps {
  room: Room;
  selectedSlots: TimeSlot[];
  onSlotClick: (room: Room, slot: TimeSlot, allSlots: TimeSlot[]) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  selectedSlots,
  onSlotClick,
}) => {
  const slots = room.slots || [];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 transition-all hover:border-stone-300">
      {/* 상단 공간 메타 정보 */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              {room.name}
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {room.type}
            </span>
          </div>

          {room.description && (
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 break-keep">
              <Info className="w-3 h-3 text-stone-400 shrink-0" />
              <span>{room.description}</span>
            </p>
          )}
        </div>

        {/* 인원 및 운영시간 배지 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span>최대 {room.capacity}인</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-stone-500">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{room.openTime} ~ {room.closeTime}</span>
          </div>
        </div>
      </div>

      {/* 시간 슬롯 그리드 */}
      <div className="mt-3">
        <div className="text-[11px] font-medium text-stone-400 mb-2 flex items-center justify-between">
          <span>예약 희망 시간 선택 (연속 선택 가능)</span>
          <span className="text-[10px] text-stone-400">
            {room.slotMinutes ? `${room.slotMinutes}분 단위` : ""}
          </span>
        </div>

        {slots.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            해당 일자의 예약 가능 시간이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlots.some(
                (s) => s.start === slot.start && s.end === slot.end
              );

              // 1) 지난 시간 (past)
              if (slot.past) {
                return (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="py-2 px-1 rounded-xl bg-stone-100/70 border border-stone-200 text-stone-400 text-center cursor-not-allowed opacity-60 flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-medium tracking-tight line-through">
                      {slot.start}
                    </span>
                    <span className="text-[10px] mt-0.5">지난시간</span>
                  </button>
                );
              }

              // 2) 이미 예약된 시간 (taken)
              if (slot.taken || !slot.available) {
                return (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="py-2 px-1 rounded-xl bg-stone-100 border border-stone-200/90 text-stone-400 text-center cursor-not-allowed flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-medium tracking-tight">
                      {slot.start}
                    </span>
                    <span className="text-[10px] font-medium text-rose-500/80 mt-0.5">
                      예약됨
                    </span>
                  </button>
                );
              }

              // 3) 예약 가능한 시간 (선택됨 or 미선택)
              return (
                <button
                  key={`${slot.start}-${slot.end}`}
                  type="button"
                  onClick={() => onSlotClick(room, slot, slots)}
                  className={`py-2 px-1.5 rounded-xl text-center transition-all duration-150 flex flex-col items-center justify-center border active:scale-95 ${
                    isSelected
                      ? "bg-emerald-800 border-emerald-900 text-white shadow-md shadow-emerald-950/20 font-bold ring-2 ring-emerald-600/30"
                      : "bg-white hover:bg-emerald-50/50 hover:border-emerald-300 border-stone-200/90 text-stone-800 font-medium"
                  }`}
                >
                  <span className="text-xs tracking-tight">
                    {slot.start}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? "text-emerald-100" : "text-stone-400"
                    }`}
                  >
                    ~ {slot.end}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
