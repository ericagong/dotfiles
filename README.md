# claude

여러 컴퓨터에서 동일한 Claude Code 설정을 사용하기 위한 git-managed 저장소.

## 무엇이 들어있나

| 경로 | 용도 |
|---|---|
| `.claude/CLAUDE.md` | Claude Code의 글로벌 사용자 지침 (`~/.claude/CLAUDE.md`에 symlink) |
| `.claude/settings.json` | Claude Code의 글로벌 설정 — SessionStart hook 포함 (`~/.claude/settings.json`에 symlink) |
| `external/karpathy-skills/` | Andrej Karpathy의 LLM 코딩 가이드라인 ([multica-ai 저장소](https://github.com/multica-ai/andrej-karpathy-skills)를 submodule로 추적) |

## 구성 방식

### `.claude/CLAUDE.md` — Claude의 행동 지침

두 부분으로 구성된다.

1. **카파시 4원칙** — `@~/claude/external/karpathy-skills/CLAUDE.md`로 import. submodule이므로 원본 저장소 변경을 따라갈 수 있다.
2. **개인 규칙** — 한국어 응답, AS-IS/TO-BE 비교 형식 등 추가 규칙.

이 분리 덕분에 *카파시 원본은 복사본 없이* 항상 컨텍스트에 로딩된다.

### `.claude/settings.json` — Claude Code 동작 설정

핵심은 **SessionStart hook**. 새 Claude Code 세션이 시작될 때마다 `cd ~/claude && git pull && submodule update`가 자동 실행된다. 즉 이 repo에 변경을 push해두면 다음 세션부터 모든 컴퓨터에서 자동 sync.

현재 hook 정의:

```json
"SessionStart": [{
  "matcher": "startup|resume",
  "hooks": [{
    "type": "command",
    "command": "cd ~/claude && git pull --ff-only --quiet 2>/dev/null && git submodule update --remote --quiet 2>/dev/null; true",
    "timeout": 10,
    "statusMessage": "claude 설정 동기화 중..."
  }]
}]
```

- `timeout: 10`초 — 네트워크 느려도 세션 시작이 무한 지연되지 않음
- `2>/dev/null; true` — 실패해도 조용히 무시, claude는 정상 시작
- `matcher: "startup|resume"` — 새 세션과 resume(--continue) 시 모두 sync

## 새 컴퓨터에서 셋업

```bash
# 1. repo 클론 (submodule 포함)
git clone --recurse-submodules https://github.com/ericagong/claude ~/claude

# 2. 기존 파일 백업 (있다면)
[ -f ~/.claude/CLAUDE.md ] && mv ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.backup-$(date +%Y%m%d)
[ -f ~/.claude/settings.json ] && mv ~/.claude/settings.json ~/.claude/settings.json.backup-$(date +%Y%m%d)

# 3. symlink 두 개 만들기
mkdir -p ~/.claude
ln -sf ~/claude/.claude/CLAUDE.md ~/.claude/CLAUDE.md
ln -sf ~/claude/.claude/settings.json ~/.claude/settings.json

# 4. 확인
ls -la ~/.claude/CLAUDE.md ~/.claude/settings.json   # 둘 다 ->  화살표 표시되면 성공
```

이후 새 컴퓨터에서 `claude` 실행 시:
- 첫 세션: 외부 import 승인 다이얼로그 1회 (CLAUDE.md의 `@import` 때문) → 승인 클릭
- 그 다음부터 SessionStart hook이 자동으로 변경사항 sync

## 변경 흐름

```
[로컬에서 .claude/CLAUDE.md 또는 settings.json 수정]
   ↓
cd ~/claude && git add . && git commit -m "..." && git push
   ↓
[다른 컴퓨터에서 claude 세션 시작]
   ↓ SessionStart hook이 자동으로
git pull → 최신 상태 적용 → 새 세션에서 즉시 작동
```

## 카파시 가이드라인 업데이트 받기

SessionStart hook의 `git submodule update --remote`가 매번 자동 처리하므로 보통 별도 작업 불필요. 단, 변경을 *미리 검토*하고 싶다면:

```bash
cd ~/claude/external/karpathy-skills && git fetch origin
git log HEAD..origin/main --oneline   # 새 커밋 확인
git diff HEAD origin/main              # 변경 내용 검토
```

## 관련 개념

- **symlink**: 다른 파일을 가리키는 포인터 파일. 원본 복사 없이 참조만 함
- **git submodule**: 다른 git 저장소를 *포인터로* 포함시키는 기능. 사본을 갖지 않고 특정 커밋을 가리킴
- **SessionStart hook**: Claude Code 공식 메커니즘. 세션 시작·resume 시점에 지정한 명령 실행

## 한계

- **첫 세션 1~3초 지연**: 네트워크 호출 때문. 보통은 거의 느껴지지 않음
- **인터넷 없는 환경**: hook은 silent fail, claude는 정상 시작 (단 sync 안 됨)
- **conflict 시**: `--ff-only`라서 fast-forward 못하면 pull 실패 → 조용히 무시. 사용자가 수동 처리 필요
- **submodule 자동 update**: 카파시 가이드가 바뀌면 모르는 새 컨텍스트가 달라질 수 있음. 가끔 `cd ~/claude/external/karpathy-skills && git log -5` 로 확인 권장
