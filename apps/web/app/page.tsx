import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, SectionCard } from "@family-playground/ui";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GameCatalogCard } from "@/components/platform/game-catalog-card";
import { validateAuthenticatedAppUser } from "@/lib/auth";
import {
  getActiveRoomForUser,
  getLeaderboard,
  listGamesWithRoomState,
  listOpenRooms,
} from "@/lib/platform";
import { getRoomPath } from "@/lib/room-routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createRoomAction } from "./(protected)/games/actions";

export const dynamic = "force-dynamic";

const playableGameKeys = new Set<string>(["word-chain"]);

interface HomePageProps {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
    next?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const oauthParams = await searchParams;
  const code = oauthParams.code;

  if (code) {
    const params = new URLSearchParams();
    params.set("code", code);

    if (oauthParams.next) {
      params.set("next", oauthParams.next);
    }

    if (oauthParams.error) {
      params.set("error", oauthParams.error);
    }

    if (oauthParams.error_description) {
      params.set("error_description", oauthParams.error_description);
    }

    redirect(`/auth/callback?${params.toString()}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountLabel = "가족 계정으로 로그인";
  let accountDescription = "로그인하면 로비, 방, 랭킹까지 바로 이어집니다.";
  let userActiveRoom:
    | Awaited<ReturnType<typeof getActiveRoomForUser>>
    | null = null;

  if (user) {
    const access = await validateAuthenticatedAppUser(user, "/");
    accountLabel = access.profile.displayName;
    accountDescription = "로그인 후 24시간 동안 세션이 유지됩니다.";
    userActiveRoom = await getActiveRoomForUser(user.id);
  }

  const [games, openRooms, leaderboard] = await Promise.all([
    listGamesWithRoomState(),
    listOpenRooms(),
    getLeaderboard(3),
  ]);
  const playableGames = games.filter((game) => playableGameKeys.has(game.gameKey));

  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#f4fff5_0%,#ffffff_42%,#eef5ff_100%)] p-5 shadow-[0_28px_90px_rgba(37,99,235,0.12)] md:rounded-[2.8rem] md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.34em] text-[#0f9d58] md:text-xs">
                FAMILY PLAYGROUND
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[#17324e] md:text-6xl">
                가족이 함께 웃고
                <br />
                같이 놀 수 있는
                <br />
                우리만의 게임 공간
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#587089] md:text-base md:leading-7">
                집에서 함께 시간을 보내고 싶을 때, 익숙한 가족 계정으로 들어와
                간단한 게임을 바로 시작할 수 있도록 만든 작은 놀이터입니다.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="rounded-full bg-[#dff5e7] px-4 py-2 text-sm font-medium text-[#0f5132]">
                  플레이 가능 게임 {playableGames.length}개
                </div>
                <div className="rounded-full bg-[#edf5ff] px-4 py-2 text-sm font-medium text-[#2b4d73]">
                  열린 방 {openRooms.length}개
                </div>
                <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-[#516882]">
                  모든 게임 최대 4명
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/80 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#4285f4]">
                ACCOUNT
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#17324e]">
                {accountLabel}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#587089]">
                {accountDescription}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[1.3rem] bg-[#f4f9ff] px-4 py-3 text-sm text-[#2b4d73]">
                  등록된 게임 {games.length}개
                </div>
                <div className="rounded-[1.3rem] bg-[#f5fbf5] px-4 py-3 text-sm text-[#0f5132]">
                  {userActiveRoom
                    ? "참가 중인 방이 있습니다"
                    : "지금은 참가 중인 방이 없습니다"}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {user ? (
                  <>
                    <Link
                      className="inline-flex rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-4 py-2.5 text-sm font-semibold text-[#0f5132] transition hover:bg-[#c8ecd5]"
                      href="/lobby"
                    >
                      로비 열기
                    </Link>
                    <Link
                      className="inline-flex rounded-full border border-[#dbe7f3] bg-white px-4 py-2.5 text-sm font-medium text-[#29435c] transition hover:bg-[#f7fbff]"
                      href="/auth/sign-out"
                    >
                      로그아웃
                    </Link>
                  </>
                ) : (
                  <GoogleSignInButton
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-5 py-3 text-sm font-semibold text-[#0f5132] shadow-[0_14px_32px_rgba(15,157,88,0.16)] transition hover:bg-[#c8ecd5] sm:w-auto"
                    label="구글 계정 로그인"
                    next="/"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {userActiveRoom ? (
          <SectionCard
            eyebrow="바로 이어하기"
            title="현재 참가 중인 방"
            description="가장 먼저 복귀해야 할 현재 컨텍스트입니다."
          >
            <div className="flex flex-col gap-3 rounded-[1.6rem] bg-[#edf7ff] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-[#4285f4]">
                  {userActiveRoom.status === "playing" ? "게임 진행 중" : "대기 중"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#17324e]">
                  {userActiveRoom.gameTitle}
                </h3>
                <p className="mt-1 text-sm text-[#587089]">
                  방장 {userActiveRoom.hostName} · 인원 {userActiveRoom.players.length}/
                  {userActiveRoom.maxPlayers}
                </p>
              </div>
              <Link
                className="inline-flex w-full items-center justify-center rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-4 py-2.5 text-sm font-semibold text-[#0f5132] transition hover:bg-[#c8ecd5] md:w-auto"
                href={getRoomPath(userActiveRoom.id, userActiveRoom.status)}
              >
                {userActiveRoom.status === "playing" ? "게임으로 복귀" : "대기방으로 이동"}
              </Link>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="게임 소개"
          title="가족이 함께 보기 쉬운 플레이 구조"
          description="게임마다 한 화면에서 상태를 빠르게 읽을 수 있게 정리했습니다."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-[1.6rem] bg-[#f5fbf5] px-4 py-4">
              <p className="text-sm font-semibold text-[#0f9d58]">빠른 시작</p>
              <p className="mt-2 text-sm leading-6 text-[#587089]">
                혼자서도 바로 방을 만들고 플레이 화면까지 이동할 수 있습니다.
              </p>
            </article>
            <article className="rounded-[1.6rem] bg-[#f4f9ff] px-4 py-4">
              <p className="text-sm font-semibold text-[#4285f4]">단순한 인원 규칙</p>
              <p className="mt-2 text-sm leading-6 text-[#587089]">
                모든 게임은 최대 4명 기준으로 통일해서 방 상태를 읽기 쉽게 맞췄습니다.
              </p>
            </article>
            <article className="rounded-[1.6rem] bg-[#fff5ea] px-4 py-4">
              <p className="text-sm font-semibold text-[#ea8600]">세션 관리</p>
              <p className="mt-2 text-sm leading-6 text-[#587089]">
                로그인 후 24시간이 지나면 자동 로그아웃되어 계정 상태가 계속 남지 않습니다.
              </p>
            </article>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="게임 리스트"
          title="지금 바로 열 수 있는 게임"
          description="열린 방이 있으면 바로 참가하고, 없으면 새 방을 만들 수 있습니다."
        >
          {games.length === 0 ? (
            <EmptyState
              title="등록된 게임이 없습니다"
              description="게임 패키지를 연결하면 이 영역에 자동으로 표시됩니다."
            />
          ) : (
            <div className="grid gap-3">
              {games.map((game) => {
                const isPlayable = playableGameKeys.has(game.gameKey);

                return (
                  <GameCatalogCard
                    key={game.id}
                    game={game}
                    isPlayable={isPlayable}
                    footer={
                      !user ? (
                        <GoogleSignInButton
                          className="inline-flex rounded-full border border-[#17324e] bg-[#17324e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#244a6e]"
                          label={
                            isPlayable
                              ? game.activeRoomId
                                ? "로그인 후 참가"
                                : "로그인 후 시작"
                              : "로그인 후 확인"
                          }
                          next="/"
                        />
                      ) : isPlayable ? (
                        game.activeRoomId ? (
                          <Link
                            className="inline-flex rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-4 py-2 text-sm font-semibold text-[#0f5132] transition hover:bg-[#c8ecd5]"
                            href={getRoomPath(
                              game.activeRoomId,
                              game.activeRoomStatus ?? "waiting",
                            )}
                          >
                            {game.activeRoomStatus === "playing"
                              ? "게임 입장"
                              : "열린 방 참가"}
                          </Link>
                        ) : userActiveRoom ? (
                          <Link
                            className="inline-flex rounded-full border border-[#dbe7f3] bg-white px-4 py-2 text-sm font-medium text-[#29435c] transition hover:bg-[#f7fbff]"
                            href={getRoomPath(
                              userActiveRoom.id,
                              userActiveRoom.status,
                            )}
                          >
                            참가 중인 방으로 이동
                          </Link>
                        ) : (
                          <form action={createRoomAction}>
                            <input name="gameId" type="hidden" value={game.id} />
                            <button
                              className="rounded-full border border-[#c7ebd4] bg-[#d8f3e1] px-4 py-2 text-sm font-semibold text-[#0f5132] transition hover:bg-[#c8ecd5]"
                              type="submit"
                            >
                              방 만들기
                            </button>
                          </form>
                        )
                      ) : (
                        <div className="rounded-full bg-[#edf2f7] px-4 py-2 text-sm font-medium text-[#5f6784]">
                          준비 중
                        </div>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            eyebrow="랭킹 미리보기"
            title="가족 점수 상위권"
            description="최근 세션 결과는 랭킹과 프로필에 자동 반영됩니다."
          >
            {leaderboard.length === 0 ? (
              <EmptyState
                title="아직 랭킹 데이터가 없습니다"
                description="첫 게임 세션이 끝나면 상위 점수가 여기 먼저 표시됩니다."
              />
            ) : (
              <div className="grid gap-3">
                {leaderboard.map((profile, index) => (
                  <article
                    key={profile.id}
                    className="rounded-[1.5rem] bg-[#f7fbff] px-4 py-4"
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#4285f4]">
                      {index + 1}위
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#18324c]">
                      {profile.displayName}
                    </h3>
                    <p className="mt-2 text-sm text-[#5d7088]">
                      누적 점수 {profile.totalScore} · 플레이 {profile.gamesPlayed}회
                    </p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="열린 방"
            title="지금 들어갈 수 있는 방"
            description="대기 중인 방과 진행 중인 방을 여기서 바로 확인합니다."
          >
            {openRooms.length === 0 ? (
              <EmptyState
                title="지금 열려 있는 방이 없습니다"
                description="게임 카드에서 새 방을 만들면 이 목록에 바로 나타납니다."
              />
            ) : (
              <div className="grid gap-3">
                {openRooms.map((room) => (
                  <article
                    key={room.id}
                    className="rounded-[1.6rem] bg-[#f7fbff] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#4285f4]">
                          {room.status === "playing" ? "IN GAME" : "WAITING ROOM"}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#17324e]">
                          {room.gameTitle}
                        </h3>
                        <p className="mt-2 text-sm text-[#5a7085]">
                          방장 {room.hostName} · {room.players.length}/{room.maxPlayers}명
                        </p>
                      </div>
                      {user ? (
                        <Link
                          className="inline-flex w-full items-center justify-center rounded-full border border-[#17324e] bg-[#17324e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#244a6e] md:w-auto"
                          href={getRoomPath(room.id, room.status)}
                        >
                          {room.status === "playing" ? "게임 입장" : "대기방 열기"}
                        </Link>
                      ) : (
                        <GoogleSignInButton
                          className="inline-flex w-full items-center justify-center rounded-full border border-[#17324e] bg-[#17324e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#244a6e] md:w-auto"
                          label="로그인 후 입장"
                          next="/"
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
