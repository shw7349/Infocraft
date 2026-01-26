#!/usr/bin/env node

/**
 * config/app.properties 파일을 읽어서 .env 파일로 동기화합니다.
 *
 * 사용법:
 *   node scripts/sync-env.js
 *   npm run env:sync
 */

const fs = require('fs');
const path = require('path');

const PROPERTIES_PATH = path.join(__dirname, '../config/app.properties');
const ENV_PATH = path.join(__dirname, '../.env');

function parseProperties(content) {
  const result = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // 빈 줄이나 주석은 건너뛰기
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // key=value 형식 파싱
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      result[key] = value;
    }
  }

  return result;
}

function generateEnvContent(properties) {
  const lines = [
    '# ============================================',
    '# 자동 생성된 파일 - 직접 수정하지 마세요',
    '# config/app.properties 파일을 수정하세요',
    '# 생성 시간: ' + new Date().toISOString(),
    '# ============================================',
    '',
  ];

  // DATABASE_URL
  if (properties.DATABASE_URL) {
    lines.push('# Database');
    lines.push(`DATABASE_URL="${properties.DATABASE_URL}"`);
    lines.push('');
  }

  // Site URL
  if (properties.SITE_URL) {
    lines.push('# Site URL');
    lines.push(`NEXT_PUBLIC_SITE_URL="${properties.SITE_URL}"`);
    lines.push('');
  }

  // NextAuth
  if (properties.AUTH_SECRET) {
    lines.push('# NextAuth.js');
    lines.push(`AUTH_SECRET="${properties.AUTH_SECRET}"`);
    lines.push('');
  }

  // Google OAuth
  if (properties.AUTH_GOOGLE_ID || properties.AUTH_GOOGLE_SECRET) {
    lines.push('# Google OAuth');
    if (properties.AUTH_GOOGLE_ID) {
      lines.push(`AUTH_GOOGLE_ID="${properties.AUTH_GOOGLE_ID}"`);
    }
    if (properties.AUTH_GOOGLE_SECRET) {
      lines.push(`AUTH_GOOGLE_SECRET="${properties.AUTH_GOOGLE_SECRET}"`);
    }
    lines.push('');
  }

  // Optional settings
  const optionalKeys = ['NEXT_PUBLIC_GA_ID', 'NEXT_PUBLIC_ADSENSE_ID'];
  const optionalLines = [];
  for (const key of optionalKeys) {
    if (properties[key]) {
      optionalLines.push(`${key}="${properties[key]}"`);
    }
  }
  if (optionalLines.length > 0) {
    lines.push('# Optional');
    lines.push(...optionalLines);
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  console.log('🔄 환경 설정 동기화 시작...\n');

  // properties 파일 확인
  if (!fs.existsSync(PROPERTIES_PATH)) {
    console.error('❌ config/app.properties 파일을 찾을 수 없습니다.');
    console.log('   config/app.properties.example을 복사하여 사용하세요:');
    console.log('   cp config/app.properties.example config/app.properties\n');
    process.exit(1);
  }

  // properties 파일 읽기
  const propertiesContent = fs.readFileSync(PROPERTIES_PATH, 'utf-8');
  const properties = parseProperties(propertiesContent);

  console.log('📖 읽은 설정:');
  for (const [key, value] of Object.entries(properties)) {
    const displayValue = key.includes('SECRET') || key.includes('PASSWORD')
      ? '********'
      : value;
    console.log(`   ${key}=${displayValue}`);
  }
  console.log('');

  // .env 파일 생성
  const envContent = generateEnvContent(properties);
  fs.writeFileSync(ENV_PATH, envContent, 'utf-8');

  console.log('✅ .env 파일이 생성되었습니다.');
  console.log(`   경로: ${ENV_PATH}\n`);

  // 필수 값 검증
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET'];
  const missing = required.filter(key => !properties[key] || properties[key].includes('your-'));

  if (missing.length > 0) {
    console.log('⚠️  다음 설정값을 확인하세요:');
    for (const key of missing) {
      console.log(`   - ${key}`);
    }
    console.log('');
  }

  console.log('🚀 다음 명령어로 서버를 시작하세요:');
  console.log('   npm run dev\n');
}

main();
