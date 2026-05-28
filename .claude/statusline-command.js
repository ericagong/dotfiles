#!/usr/bin/env node
// Claude Code statusline — node 버전 (jq 의존 제거)
// Claude Code가 stdin으로 넘겨주는 JSON을 읽어 상태줄 한 줄을 출력한다.
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

// stdin(JSON) 읽기 — 없거나 깨져도 안전하게 빈 객체로
let data = {};
try {
  const raw = require('fs').readFileSync(0, 'utf8');
  if (raw.trim()) data = JSON.parse(raw);
} catch (e) {}

const username = os.userInfo().username;
const hostname = os.hostname().split('.')[0];                 // `hostname -s` 대응
const currentDir = (data.workspace && data.workspace.current_dir) || process.cwd();
const modelName = (data.model && data.model.display_name) || '';
const remaining = data.context_window && data.context_window.remaining_percentage;
const dirName = path.basename(currentDir);

// git 브랜치 (해당 디렉토리가 git repo일 때만)
let gitBranch = '';
try {
  const branch = execSync('git --no-optional-locks branch --show-current', {
    cwd: currentDir, stdio: ['ignore', 'pipe', 'ignore']
  }).toString().trim();
  if (branch) gitBranch = ` \uD83C\uDF3F \x1b[32m${branch}\x1b[0m`;
} catch (e) {}

// 컨텍스트 잔여율 색상 (70%+ 초록 / 40%+ 노랑 / 그 이하 빨강)
let contextInfo = '';
if (remaining !== undefined && remaining !== null && remaining !== '') {
  const r = Math.round(Number(remaining));
  let color = '\x1b[91m';
  if (r >= 70) color = '\x1b[92m';
  else if (r >= 40) color = '\x1b[93m';
  contextInfo = ` \uD83D\uDCCA ${color}${remaining}%\x1b[0m`;
}

process.stdout.write(
  `\uD83D\uDC64 \x1b[96m${username}@${hostname}\x1b[0m` +
  ` \uD83C\uDFE0 \x1b[94m${dirName}\x1b[0m` +
  gitBranch +
  ` \uD83E\uDD16 \x1b[95m${modelName}\x1b[0m` +
  contextInfo
);
