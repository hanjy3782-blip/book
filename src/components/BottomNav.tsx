import React from "react";
import type { ActiveTab } from "../types";
import { CalendarCheck2, BookmarkCheck, BookOpen, ShieldCheck } from "lucide-react";

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isAdminActive: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  isAdminActive,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg">
      <div className="max-w-[480px] mx-auto px-2 flex items-center justify-around h-16">
        {/* 탭 1: 예약하기 */}
        <button
          type="button"
          onClick={() => onChangeTab("reserve")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "reserve"
              ? "text-emerald-800 font-bold scale-105"
              : "text-stone-400 hover:text-stone-600 font-medium"
          }`}
        >
          <div className="relative">
            <CalendarCheck2 className="w-5 h-5" />
            {activeTab === "reserve" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-800 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1">예약하기</span>
        </button>

        {/* 탭 2: 내 예약 */}
        <button
          type="button"
          onClick={() => onChangeTab("my")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "my"
              ? "text-emerald-800 font-bold scale-105"
              : "text-stone-400 hover:text-stone-600 font-medium"
          }`}
        >
          <div className="relative">
            <BookmarkCheck className="w-5 h-5" />
            {activeTab === "my" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-800 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1">내 예약</span>
        </button>

        {/* 탭 3: 이용 안내 */}
        <button
          type="button"
          onClick={() => onChangeTab("info")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "info"
              ? "text-emerald-800 font-bold scale-105"
              : "text-stone-400 hover:text-stone-600 font-medium"
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {activeTab === "info" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-800 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1">이용 안내</span>
        </button>

        {/* 관리자 탭 (인증되었거나 관리자 화면일 때 노출) */}
        {isAdminActive && (
          <button
            type="button"
            onClick={() => onChangeTab("admin")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "admin"
                ? "text-amber-700 font-bold scale-105"
                : "text-amber-600/70 hover:text-amber-700 font-medium"
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              {activeTab === "admin" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-600 rounded-full" />
              )}
            </div>
            <span className="text-[11px] mt-1">관리자</span>
          </button>
        )}
      </div>
    </nav>
  );
};
