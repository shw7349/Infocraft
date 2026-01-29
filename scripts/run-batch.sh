#!/bin/bash
# INFOCRAFT 배치 실행 스크립트

cd /Users/songhyeon-u/IdeaProjects/INFOCRAFT
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# 로그 파일
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/batch-$(date +%Y%m%d-%H%M%S).log"

echo "========================================" >> "$LOG_FILE"
echo "배치 시작: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Node.js 경로 확인 후 실행
npx tsx scripts/batch-pipeline.ts >> "$LOG_FILE" 2>&1

echo "배치 종료: $(date)" >> "$LOG_FILE"

# 7일 이상 된 로그 삭제
find "$LOG_DIR" -name "batch-*.log" -mtime +7 -delete
