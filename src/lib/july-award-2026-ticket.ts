import { randomUUID } from "crypto";

export const JULY_AWARD_TICKET_VERIFY_BASE = "https://punab.com/july-award-2026/ticket";

/** Short unique ticket id, e.g. JA26-9F3C2A1B. */
export function generateJulyAwardTicketId(): string {
  return `JA26-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function buildJulyAwardTicketUrl(ticketId: string): string {
  return `${JULY_AWARD_TICKET_VERIFY_BASE}/${encodeURIComponent(ticketId)}`;
}
