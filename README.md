# dotfiles

여러 컴퓨터에서 동일하게 사용하기 위해 git으로 관리하는 개인 설정 파일 저장소.

## 무엇이 들어있나

| 경로 | 용도 |
|---|---|
| `.claude/CLAUDE.md` | Claude Code의 글로벌 사용자 지침 (`~/.claude/CLAUDE.md`에 symlink) |
| `external/karpathy-skills/` | Andrej Karpathy의 LLM 코딩 가이드라인 ([multica-ai 저장소](https://github.com/multica-ai/andrej-karpathy-skills)를 submodule로 추적) |

## 구성 방식

`.claude/CLAUDE.md`는 **두 부분**으로 구성된다.

1. **카파시 4원칙** — `@~/dotfiles/external/karpathy-skills/CLAUDE.md`로 import. submodule이므로 원본 저장소가 업데이트되면 그 변경사항을 따라갈 수 있다.
2. **언어 및 커뮤니케이션 규칙** — 한국어 응답, 한국어 주석 등 개인 추가 규칙.

이 분리 덕분에 *카파시 원본은 복사본을 유지하지 않고도* 항상 컨텍스트에 로딩된다.

## 새 컴퓨터에서 셋업

```bash
# 1. dotfiles repo 클론 (submodule 포함)
git clone --recurse-submodules https://github.com/ericagong/dotfiles ~/dotfiles

# 2. 기존 글로벌 CLAUDE.md 백업 (있다면)
[ -f ~/.claude/CLAUDE.md ] && mv ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.backup-$(date +%Y%m%d)

# 3. symlink로 연결
mkdir -p ~/.claude
ln -sf ~/dotfiles/.claude/CLAUDE.md ~/.claude/CLAUDE.md

# 4. 확인
ls -la ~/.claude/CLAUDE.md  # symlink 화살표(->) 표시되면 성공
```

## 카파시 가이드라인 업데이트 받기

```bash
cd ~/dotfiles
git submodule update --remote external/karpathy-skills
git add external/karpathy-skills
git commit -m "karpathy-skills submodule 업데이트"
```

## 관련 개념

- **dotfile**: 점(`.`)으로 시작하는 설정 파일/디렉토리 (`.gitconfig`, `.zshrc`, `.claude/` 등)
- **symlink**: 다른 파일을 가리키는 포인터 파일. 원본을 복사하지 않고 참조만 함
- **git submodule**: 다른 git 저장소를 *포인터로* 포함시키는 기능. 사본을 갖지 않고 특정 커밋을 가리키기만 함
