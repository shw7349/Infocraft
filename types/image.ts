/**
 * 이미지 생성 요청 타입
 */
export interface ImageGenerationRequest {
  keyword: string;
  style?: 'realistic' | 'illustration' | 'infographic';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

/**
 * 이미지 생성 응답 타입
 */
export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: string;
}

/**
 * 이미지 스타일 옵션
 */
export const IMAGE_STYLES = {
  realistic: '사실적인 사진 스타일',
  illustration: '일러스트레이션 스타일',
  infographic: '인포그래픽 스타일',
} as const;

/**
 * 이미지 크기 옵션
 */
export const IMAGE_SIZES = {
  '1024x1024': '정사각형 (1:1)',
  '1792x1024': '가로형 (16:9)',
  '1024x1792': '세로형 (9:16)',
} as const;
