import { ImageGenerationRequest, ImageGenerationResponse } from '@/types/image';
// TODO: OPENAI_API_KEY 설정 후 주석 해제
// import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// TODO: OPENAI_API_KEY 설정 후 주석 해제
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

/**
 * 한국어 키워드를 영어 이미지 프롬프트로 변환
 *
 * @param keyword - 한국어 키워드
 * @param style - 이미지 스타일
 * @returns 영어 이미지 프롬프트
 */
export function generateImagePrompt(
  keyword: string,
  style: 'realistic' | 'illustration' | 'infographic' = 'illustration'
): string {
  const stylePrompts = {
    realistic: 'Professional photograph, high quality, realistic',
    illustration: 'Modern illustration, clean design, professional',
    infographic: 'Infographic style, data visualization, clean layout',
  };

  const basePrompt = stylePrompts[style];

  // 한국어 키워드를 영어로 번역하는 로직
  // 실제로는 번역 API를 사용하거나 사전 정의된 매핑을 사용할 수 있음
  // 여기서는 간단한 예시로 키워드를 그대로 사용
  const prompt = `${basePrompt}, related to "${keyword}", suitable for a Korean information website, clean background, no text overlay`;

  return prompt;
}

/**
 * DALL-E API를 사용하여 이미지 생성
 *
 * @param request - 이미지 생성 요청
 * @returns 이미지 URL
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<string> {
  const { keyword, style = 'illustration', size = '1024x1024' } = request;

  const prompt = generateImagePrompt(keyword, style);

  // TODO: OPENAI_API_KEY 설정 후 주석 해제
  // try {
  //   const response = await openai.images.generate({
  //     model: 'dall-e-3',
  //     prompt: prompt,
  //     n: 1,
  //     size: size,
  //     quality: 'standard',
  //     response_format: 'url',
  //   });
  //
  //   const imageUrl = response.data[0].url;
  //   if (!imageUrl) {
  //     throw new Error('이미지 URL을 가져올 수 없습니다.');
  //   }
  //
  //   return imageUrl;
  // } catch (error) {
  //   console.error('이미지 생성 오류:', error);
  //   throw new Error(`이미지 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  // }

  // 임시 반환값 (API 활성화 전)
  console.log('이미지 생성 요청 (현재 비활성화):', { keyword, style, size, prompt });
  throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. API를 활성화하려면 .env 파일에 OPENAI_API_KEY를 추가하세요.');
}

/**
 * 이미지를 다운로드하고 로컬에 저장
 *
 * @param imageUrl - 다운로드할 이미지 URL
 * @param keyword - 키워드 (파일명 생성용)
 * @returns 로컬 파일 경로
 */
export async function saveImage(
  imageUrl: string,
  keyword: string
): Promise<string> {
  // TODO: OPENAI_API_KEY 설정 후 주석 해제
  // try {
  //   const response = await fetch(imageUrl);
  //   if (!response.ok) {
  //     throw new Error(`이미지 다운로드 실패: ${response.statusText}`);
  //   }
  //
  //   const buffer = Buffer.from(await response.arrayBuffer());
  //
  //   // 파일명 생성 (키워드 + 타임스탬프)
  //   const timestamp = Date.now();
  //   const sanitizedKeyword = keyword
  //     .replace(/[^a-zA-Z0-9가-힣]/g, '-')
  //     .substring(0, 50);
  //   const filename = `${sanitizedKeyword}-${timestamp}.png`;
  //
  //   // 저장 경로
  //   const publicDir = path.join(process.cwd(), 'public', 'images', 'articles');
  //   await fs.mkdir(publicDir, { recursive: true });
  //
  //   const filepath = path.join(publicDir, filename);
  //   await fs.writeFile(filepath, buffer);
  //
  //   // 웹 접근 가능한 경로 반환
  //   return `/images/articles/${filename}`;
  // } catch (error) {
  //   console.error('이미지 저장 오류:', error);
  //   throw new Error(`이미지 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  // }

  // 임시 반환값 (API 활성화 전)
  console.log('이미지 저장 요청 (현재 비활성화):', { imageUrl, keyword });
  throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. API를 활성화하려면 .env 파일에 OPENAI_API_KEY를 추가하세요.');
}

/**
 * 이미지 생성 및 저장 통합 함수
 *
 * @param request - 이미지 생성 요청
 * @returns 이미지 생성 응답
 */
export async function generateAndSaveImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    // 이미지 생성
    const imageUrl = await generateImage(request);

    // 이미지 저장
    const localPath = await saveImage(imageUrl, request.keyword);

    return {
      success: true,
      imageUrl,
      localPath,
    };
  } catch (error) {
    console.error('이미지 생성 및 저장 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
