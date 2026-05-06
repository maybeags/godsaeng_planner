// # 태그 파서 — 한글/영문/숫자/_/- 허용. 공백/개행/구두점에서 종료.
const TAG_REGEX = /#([\p{L}\p{N}_-]+)/gu;

/** content 에서 # 토큰을 추출하고, content 본문에서는 제거한 깔끔한 결과를 반환 */
export function extractTags(raw: string): { content: string; tags: string[] } {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const match of raw.matchAll(TAG_REGEX)) {
    const name = match[1];
    if (name && !seen.has(name)) {
      seen.add(name);
      tags.push(name);
    }
  }

  const content = raw
    .replace(TAG_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { content, tags };
}

/** 입력 중 커서 위치 직전의 활성 # 토큰을 찾기 (자동완성용) */
export function findActiveTagToken(
  value: string,
  cursor: number
): { start: number; query: string } | null {
  const before = value.slice(0, cursor);
  const m = before.match(/(?:^|\s)#([\p{L}\p{N}_-]*)$/u);
  if (!m) return null;
  // 토큰 시작 위치 = 커서 - (#포함 매칭 길이)
  const matchedLen = m[0].endsWith(m[1])
    ? m[1].length + 1 // + '#'
    : m[0].length;
  return { start: cursor - matchedLen, query: m[1] };
}
