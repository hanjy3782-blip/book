/**
 * 구글 앱스 스크립트(Google Apps Script) 백엔드 연동 API 클라이언트
 * 
 * - 모든 요청은 POST 메소드를 사용합니다.
 * - 브라우저의 CORS Preflight(사전 OPTIONS 요청)을 방지하기 위해
 *   Content-Type을 반드시 "text/plain;charset=utf-8" 로 전송합니다.
 * - 응답은 { ok: true, data: ... } 또는 { ok: false, error: "한국어 메시지" } 형식입니다.
 */

import { API_URL } from "./config";
import type {
  ApiResponse,
  InitData,
  AvailabilityData,
  Reservation,
  ReservePayload,
  CancelPayload,
} from "./types";

/**
 * 공통 fetch 래퍼 함수
 */
async function postRequest<T>(payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      // CORS 사전 요청(Preflight OPTIONS)을 건너뛰기 위해 text/plain 지정
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `서버 응답 오류가 발생했습니다. (HTTP ${response.status})`,
      };
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json;
  } catch (err) {
    console.error("API 요청 중 오류 발생:", err);
    return {
      ok: false,
      error: "네트워크 연결이 불안정하거나 서버 응답이 없습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 1) 초기화 정보 조회 (도서관 설정 및 공간 기본 목록)
 */
export async function init(): Promise<ApiResponse<InitData>> {
  return postRequest<InitData>({
    action: "init",
  });
}

/**
 * 2) 특정 날짜 및 공간의 예약 가능 시간 슬롯 조회
 * @param date YYYY-MM-DD 형식
 * @param roomId 선택적 공간 식별자
 */
export async function availability(
  date: string,
  roomId?: string
): Promise<ApiResponse<AvailabilityData>> {
  const payload: Record<string, unknown> = {
    action: "availability",
    date,
  };
  if (roomId) {
    payload.roomId = roomId;
  }
  return postRequest<AvailabilityData>(payload);
}

/**
 * 3) 공간 예약 신청
 */
export async function reserve(
  params: ReservePayload
): Promise<ApiResponse<Reservation>> {
  return postRequest<Reservation>({
    action: "reserve",
    roomId: params.roomId,
    date: params.date,
    startTime: params.startTime,
    endTime: params.endTime,
    userName: params.userName,
    userId: params.userId,
    phone: params.phone || "",
    pin: params.pin, // 4자리 숫자
  });
}

/**
 * 4) 내 예약 목록 조회 (학번 + 비밀번호 4자리)
 */
export async function myReservations(
  userId: string,
  pin: string
): Promise<ApiResponse<Reservation[]>> {
  return postRequest<Reservation[]>({
    action: "myReservations",
    userId,
    pin,
  });
}

/**
 * 5) 예약 취소 (사용자 본인 또는 관리자)
 */
export async function cancel(
  params: CancelPayload
): Promise<ApiResponse<{ message?: string; cancelledReservationId?: string }>> {
  const payload: Record<string, unknown> = {
    action: "cancel",
    reservationId: params.reservationId,
  };

  if (params.adminKey) {
    payload.adminKey = params.adminKey;
  } else {
    payload.userId = params.userId;
    payload.pin = params.pin;
  }

  return postRequest<{ message?: string; cancelledReservationId?: string }>(payload);
}

/**
 * 6) 관리자 전체 예약 내역 조회
 */
export async function adminList(
  adminKey: string,
  date?: string
): Promise<ApiResponse<Reservation[]>> {
  const payload: Record<string, unknown> = {
    action: "adminList",
    adminKey,
  };
  if (date) {
    payload.date = date;
  }
  return postRequest<Reservation[]>(payload);
}
