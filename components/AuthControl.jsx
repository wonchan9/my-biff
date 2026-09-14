'use client';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

// 로그인 상태에 따라 로그인 버튼 또는 계정 메뉴를 보여줌
export default function AuthControl() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <SignInButton mode="modal">
      <button
        className="text-sm bg-gray-800 text-white rounded-full px-3 py-2 border border-gray-700 hover:bg-gray-700 transition-colors"
        title="로그인하면 찜/스케줄이 기기와 무관하게 안전하게 보관돼요"
      >
        로그인
      </button>
    </SignInButton>
  );
}
