import React, { useRef } from "react";
import { generateDateList, formatKoreanDate } from "../utils/date";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  startDate: string;
  advanceDays: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  startDate,
  advanceDays,
  selectedDate,
  onSelectDate,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateList = generateDateList(startDate || new Date().toISOString().slice(0, 10), advanceDays || 7);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white border-b border-stone-200/80 py-3 select-none">
      <div className="max-w-[480px] mx-auto px-4">
        {/* 날짜 상단 안내 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-800" />
            <span>예약 날짜 선택</span>
            <span className="text-[11px] font-normal text-stone-400">
              ({formatKoreanDate(selectedDate)})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors"
              aria-label="이전 날짜로 스크롤"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors"
              aria-label="다음 날짜로 스크롤"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 가로 스크롤 날짜 칩 목록 */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {dateList.map((item) => {
            const isSelected = item.date === selectedDate;

            // 요일별 색상 구분 (토: 파랑, 일: 빨강, 평일: 일반)
            let dayColor = "text-stone-500";
            if (item.isSaturday) dayColor = "text-blue-600";
            if (item.isSunday) dayColor = "text-rose-600";

            return (
              <button
                key={item.date}
                type="button"
                onClick={() => onSelectDate(item.date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[54px] py-2 px-1.5 rounded-xl transition-all duration-200 relative border ${
                  isSelected
                    ? "bg-emerald-800 border-emerald-800 text-white shadow-md shadow-emerald-950/20 scale-[1.03]"
                    : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800 active:scale-95"
                }`}
              >
                {/* 오늘 표시 뱃지 */}
                {item.isToday && (
                  <span
                    className={`text-[9px] font-bold px-1 rounded-full mb-0.5 leading-tight ${
                      isSelected
                        ? "bg-emerald-950/80 text-emerald-200"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    오늘
                  </span>
                )}

                {/* 요일 */}
                <span
                  className={`text-[11px] font-semibold tracking-tight ${
                    isSelected ? "text-white" : dayColor
                  }`}
                >
                  {item.dayName}
                </span>

                {/* 일자 */}
                <span className="text-base font-bold leading-tight mt-0.5">
                  {item.dayNumber}
                </span>

                {/* 월 작게 표시 */}
                <span
                  className={`text-[9px] mt-0.5 ${
                    isSelected ? "text-emerald-200" : "text-stone-400"
                  }`}
                >
                  {item.monthNumber}월
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
