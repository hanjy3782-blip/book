/**
 * 날짜 및 시간 계산 유틸리티
 */

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 */
export function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 Date 객체로 변환
 */
export function parseYMD(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 오늘 날짜 기준 YYYY-MM-DD 문자열 반환
 */
export function getTodayYMD(): string {
  return formatDateToYMD(new Date());
}

/**
 * 오늘부터 advanceDays일까지의 날짜 리스트 생성
 */
export function generateDateList(startDateYMD: string, advanceDays: number): {
  date: string;
  dayName: string;
  dayNumber: number;
  monthNumber: number;
  isSaturday: boolean;
  isSunday: boolean;
  isToday: boolean;
}[] {
  const start = parseYMD(startDateYMD);
  const todayStr = getTodayYMD();
  const list = [];

  for (let i = 0; i <= advanceDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const dateStr = formatDateToYMD(current);
    const dayIndex = current.getDay();

    list.push({
      date: dateStr,
      dayName: KOREAN_DAYS[dayIndex],
      dayNumber: current.getDate(),
      monthNumber: current.getMonth() + 1,
      isSaturday: dayIndex === 6,
      isSunday: dayIndex === 0,
      isToday: dateStr === todayStr,
    });
  }

  return list;
}

/**
 * 한국식 날짜 포맷 (예: "10월 10일 (토)")
 */
export function formatKoreanDate(ymd: string, includeYear = false): string {
  try {
    const [year, month, day] = ymd.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dayName = KOREAN_DAYS[d.getDay()];

    if (includeYear) {
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    return `${month}월 ${day}일 (${dayName})`;
  } catch {
    return ymd;
  }
}

/**
 * 시작시간과 종료시간(HH:mm)으로 총 소요 시간(분) 계산
 */
export function calculateMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

/**
 * 분을 한국어 시간 텍스트로 변환 (예: 120 -> "2시간", 90 -> "1시간 30분")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}시간 ${remainingMins}분`;
  } else if (hours > 0) {
    return `${hours}시간`;
  }
  return `${remainingMins}분`;
}
