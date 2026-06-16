/** 도메인 규칙 위반. 애플리케이션/API 레이어가 잡아 4xx로 변환한다. */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_found"
      | "forbidden"
      | "invalid_state"
      | "bad_input",
  ) {
    super(message);
    this.name = "DomainError";
  }
}
