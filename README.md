# claude

여러 컴퓨터에서 동일한 Claude Code 설정을 사용하기 위한 git-managed 저장소.

## 무엇이 들어있나

| 경로 | 용도 |
|---|---|
| `.claude/CLAUDE.md` | Claude Code의 글로벌 사용자 지침 (`~/.claude/CLAUDE.md`에 symlink) |
| `external/karpathy-skills/` | Andrej Karpathy의 LLM 코딩 가이드라인 ([multica-ai 저장소](https://github.com/multica-ai/andrej-karpathy-skills)를 submodule로 추적) |

## 구성 방식

`.claude/CLAUDE.md`는 **두 부분**으로 구성된다.

1. **카파시 4원칙** — `@~/claude/external/karpathy-skills/CLAUDE.md`로 import. submodule이므로 원본 저장소가 업데이트되면 그 변경사항을 따라갈 수 있다.
2. **언어 규칙 + 응답 스타일** — 한국어 응답, AS-IS/TO-BE 비교 형식 등 개인 추가 규칙.

이 분리 덕분에 *카파시 원본은 복사본을 유지하지 않고도* 항상 컨텍스트에 로딩된다.

## 새 컴퓨터에서 셋업

```bash
# 1. repo 클론 (submodule 포함)
git clone --recurse-submodules https://github.com/ericagong/claude ~/claude

# 2. 기존 글로벌 CLAUDE.md 백업 (있다면)
[ -f ~/.claude/CLAUDE.md ] && mv ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.backup-$(date +%Y%m%d)

# 3. symlink로 연결
mkdir -p ~/.claude
ln -sf ~/claude/.claude/CLAUDE.md ~/.claude/CLAUDE.md

# 4. SessionStart hook 설정으로 자동 sync 활성화 (선택)
#    ~/.claude/settings.json의 hooks 섹션 참조

# 5. 확인
ls -la ~/.claude/CLAUDE.md  # symlink 화살표(->) 표시되면 성공
```

## 자동 동기화 (SessionStart hook)

`~/.claude/settings.json`에 SessionStart hook을 등록해두면 **Claude Code 세션 시작 시마다 자동으로 `git pull` + submodule update**가 실행된다. 별도의 `dotpull` 같은 수동 명령 불필요.

설정 예시:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/claude && git pull --ff-only --quiet 2>/dev/null && git submodule update --remote --quiet 2>/dev/null; true",
            "timeout": 10,
            "statusMessage": "claude 설정 동기화 중..."
          }
        ]
      }
    ]
  }
}
```

- `timeout: 10`초로 캡 — 네트워크 느려도 세션 시작이 늦어지지 않음
- `2>/dev/null; true` — 실패해도 조용히 무시, claude 세션은 정상 시작
- `matcher: "startup|resume"` — 새 세션과 resume 시 모두 sync

## 카파시 가이드라인 업데이트 받기

SessionStart hook이 자동으로 처리하지만, 수동으로 미리 확인하고 싶으면:

```bash
cd ~/claude/external/karpathy-skills && git fetch origin
git log HEAD..origin/main --oneline   # 새 커밋 확인
git diff HEAD origin/main              # 변경 내용 검토

# 마음에 들면 부모 repo에 적용
cd ~/claude
git submodule update --remote external/karpathy-skills
git add external/karpathy-skills && git commit -m "karpathy-skills 업데이트" && git push
```

## 관련 개념

- **symlink**: 다른 파일을 가리키는 포인터 파일. 원본을 복사하지 않고 참조만 함
- **git submodule**: 다른 git 저장소를 *포인터로* 포함시키는 기능. 사본을 갖지 않고 특정 커밋을 가리키기만 함
- **SessionStart hook**: Claude Code 공식 메커니즘. 세션 시작·resume 시점에 지정한 명령 실행
