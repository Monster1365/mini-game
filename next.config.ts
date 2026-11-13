import type { NextConfig } from "next";

// public/의 게임 파일·이미지는 파일명에 해시가 없어 기본값이 "매번 재검증"이다.
// 1시간은 브라우저 캐시를 그대로 쓰고, 그 뒤 하루 동안은 캐시를 보여주며 백그라운드로 갱신한다.
// (배포 후 이미 방문한 사람은 최대 1시간 이전 버전을 볼 수 있다)
const STATIC_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  async headers() {
    return ["/play/:path*", "/images/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: STATIC_CACHE }],
    }));
  },
};

export default nextConfig;
