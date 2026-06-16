import { nanoid, customAlphabet } from "nanoid";

const alphanumeric = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
);

/** Short URL-friendly room ID (~6 chars). */
export function newRoomId(): string {
  return alphanumeric(6);
}

/** Host-only secret token (~21 chars). */
export function newHostToken(): string {
  return nanoid(21);
}

/** Participant ID (~21 chars). */
export function newParticipantId(): string {
  return nanoid(21);
}

/** Candidate ID (~21 chars). */
export function newCandidateId(): string {
  return nanoid(21);
}
