import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveImage } from '@/lib/image-generator';
import { ImageGenerationRequest } from '@/types/image';

/**
 * 이미지 생성 API
 *
 * POST /api/images/generate
 *
 * Body:
 * {
 *   keyword: string,
 *   style?: 'realistic' | 'illustration' | 'infographic',
 *   size?: '1024x1024' | '1792x1024' | '1024x1792'
 * }
 *
 * 활성화 방법:
 * 1. .env 파일에 OPENAI_API_KEY 추가
 * 2. lib/image-generator.ts에서 주석 해제
 * 3. npm install openai 실행
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, style, size } = body as ImageGenerationRequest;

    // 입력 검증
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'keyword는 필수 입력값입니다.' },
        { status: 400 }
      );
    }

    // TODO: OPENAI_API_KEY 설정 후 주석 해제
    // const result = await generateAndSaveImage({
    //   keyword,
    //   style: style || 'illustration',
    //   size: size || '1024x1024',
    // });
    //
    // if (!result.success) {
    //   return NextResponse.json(
    //     { success: false, error: result.error },
    //     { status: 500 }
    //   );
    // }
    //
    // return NextResponse.json({
    //   success: true,
    //   imageUrl: result.imageUrl,
    //   localPath: result.localPath,
    // });

    // 임시 응답 (API 활성화 전)
    console.log('이미지 생성 API 호출 (현재 비활성화):', { keyword, style, size });

    return NextResponse.json({
      success: false,
      error: 'OPENAI_API_KEY가 설정되지 않았습니다. 활성화 방법:\n1. .env 파일에 OPENAI_API_KEY 추가\n2. lib/image-generator.ts에서 주석 해제\n3. npm install openai 실행',
      placeholder: {
        message: 'API 활성화 후 실제 이미지가 생성됩니다.',
        requestedKeyword: keyword,
        requestedStyle: style || 'illustration',
        requestedSize: size || '1024x1024',
      },
    }, { status: 503 });

  } catch (error) {
    console.error('이미지 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청 처리 (API 정보 제공)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/generate',
    method: 'POST',
    description: 'DALL-E를 사용한 이미지 생성 API',
    status: 'inactive',
    activation: {
      step1: '.env 파일에 OPENAI_API_KEY 추가',
      step2: 'lib/image-generator.ts에서 주석 해제',
      step3: 'npm install openai 실행',
    },
    requestBody: {
      keyword: 'string (필수) - 이미지 생성 키워드',
      style: "string (선택) - 'realistic' | 'illustration' | 'infographic'",
      size: "string (선택) - '1024x1024' | '1792x1024' | '1024x1792'",
    },
    responseBody: {
      success: 'boolean',
      imageUrl: 'string (성공 시)',
      localPath: 'string (성공 시)',
      error: 'string (실패 시)',
    },
  });
}
