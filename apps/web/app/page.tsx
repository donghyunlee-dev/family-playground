import Link from "next/link";
import { EmptyState, SectionCard } from "@family-playground/ui";
import { GameCatalogCard } from "@/components/platform/game-catalog-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { buildSignedOutLoginHref } from "@/lib/auth";
import {
  ensureFamilyAccess,
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

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountLabel = "로그인 필요";
  let userActiveRoom:
    | Awaited<ReturnType<typeof getActiveRoomForUser>>
    | null = null;

  if (user) {
    const access = await ensureFamilyAccess(user);

    if (!access.allowed) {
      return (
        <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-6">
          <div className="mx-auto max-w-5xl">
            <EmptyState
              title="이 계정은 아직 사용할 수 없습니다"
              description="가족 계정 목록 확인 후 다시 로그인해야 합니다."
            />
            <div className="mt-4">
              <Link
                className="inline-flex rounded-full border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-medium text-[#25314b]"
                href={buildSignedOutLoginHref(access.reason)}
              >
                다시 로그인
              </Link>
            </div>
          </div>
        </main>
      );
    }

    accountLabel = access.profile?.displayName ?? "가족 플레이어";
    userActiveRoom = await getActiveRoomForUser(user.id);
  }

  const [games, openRooms, leaderboard] = await Promise.all([
    listGamesWithRoomState(),
    listOpenRooms(),
    getLeaderboard(3),
  ]);
  const playableCount = games.filter((game) =>
    playableGameKeys.has(game.gameKey),
  ).length;

  return (
    <main className="min-h-screen px-4 py-4 text-slate-950 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-5xl gap-4 md:gap-6">
        <header className="rounded-[1.9rem] border border-[#d8dee8] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] md:rounded-[2.4rem] md:p-6">
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#64748b] md:text-xs">
                  FAMILY PLAYGROUND
                </p>
              </div>
              <div className="min-w-[240px] rounded-[1.4rem] border border-[#d8dee8] bg-[#f8fafc] p-4">
                <p className="text-xs tracking-[0.18em] text-[#64748b]">
                  ACCOUNT
                </p>
                <p className="mt-2 text-lg font-semibold text-[#0f172a]">
                  {accountLabel}
                </p>
                <div className="mt-4">
                  {user ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="inline-flex rounded-full border border-[#0f172a] bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e293b]"
                        href="/lobby"
                      >
                        로비 열기
                      </Link>
                      <Link
                        className="inline-flex rounded-full border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#f8fafc]"
                        href="/auth/sign-out"
                      >
                        로그아웃
                      </Link>
                    </div>
                  ) : (
                    <GoogleSignInButton
                      className="inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-5 py-3 text-sm font-semibold text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                      label="구글 계정 로그인"
                      next="/"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
                등록된 게임 {games.length}개
              </div>
              <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
                플레이 가능 {playableCount}개
              </div>
              <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
                열린 방 {openRooms.length}개
              </div>
              <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
                {userActiveRoom
                  ? "현재 참가 중인 방이 있습니다"
                  : "아직 참가 중인 방이 없습니다"}
              </div>
            </div>
          </div>
        </header>

        {userActiveRoom ? (
          <SectionCard
            eyebrow="바로 이어하기"
            title="현재 참가 중인 방"
            description="로그인 후 가장 먼저 돌아갈 수 있는 진행 중 컨텍스트입니다."
          >
            <div className="flex flex-col gap-3 rounded-[1.5rem] bg-[#fff9ec] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[#f97316]">
                  {userActiveRoom.status === "playing" ? "게임 진행 중" : "대기 중"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#26324b]">
                  {userActiveRoom.gameTitle}
                </h3>
                <p className="mt-1 text-sm text-[#5f6784]">
                  방장 {userActiveRoom.hostName} · 인원 {userActiveRoom.players.length}/
                  {userActiveRoom.maxPlayers}
                </p>
              </div>
              <Link
                className="inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2.5 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] md:w-auto"
                href={getRoomPath(userActiveRoom.id, userActiveRoom.status)}
              >
                {userActiveRoom.status === "playing" ? "게임으로 복귀" : "대기방으로 이동"}
              </Link>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard eyebrow="라인업" title="게임 리스트" description=" ">
          {games.length === 0 ? (
            <EmptyState
              title="등록된 게임이 없습니다"
              description=""
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
                          className="inline-flex rounded-full border border-[#d8dee8] bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e293b]"
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
                            className="inline-flex rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
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
                            className="inline-flex rounded-full border border-[#d8dee8] bg-white px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#f8fafc]"
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
                              className="rounded-full border border-[#ffd58c] bg-[#ffd666] px-4 py-2 text-sm font-medium text-[#25314b] transition hover:bg-[#ffc94f] hover:text-[#1f2a44]"
                              type="submit"
                            >
                              방 만들기
                            </button>
                          </form>
                        )
                      ) : (
                        <div className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-medium text-[#5f6784]">
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
            <div className="grid gap-3 md:grid-cols-3">
              {leaderboard.map((profile, index) => (
                <article
                  key={profile.id}
                  className="rounded-[1.5rem] border border-[#ffdca8] bg-[#fffdf9] px-4 py-4"
                >
                  <p className="text-xs tracking-[0.18em] text-[#f97316]">
                    {index + 1}위
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#26324b]">
                    {profile.displayName}
                  </h3>
                  <p className="mt-2 text-sm text-[#5f6784]">
                    누적 점수 {profile.totalScore} · 플레이 {profile.gamesPlayed}회
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="방" title="열려 있는 방" description=" ">
          {openRooms.length === 0 ? (
            <EmptyState
              title="지금 열려 있는 방이 없습니다"
              description=""
            />
          ) : (
            <div className="grid gap-3">
              {openRooms.map((room) => (
                <article
                  key={room.id}
                  className="rounded-[1.5rem] border border-[#d8dee8] bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] tracking-[0.18em] text-[#64748b]">
                        {room.status === "playing" ? "IN GAME" : "WAITING ROOM"}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">
                        {room.gameTitle}
                      </h3>
                      <p className="mt-2 text-sm text-[#475569]">
                        방장 {room.hostName} · {room.players.length}/{room.maxPlayers}명
                      </p>
                    </div>
                    {user ? (
                      <Link
                        className="inline-flex w-full items-center justify-center rounded-full border border-[#0f172a] bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e293b] md:w-auto"
                        href={getRoomPath(room.id, room.status)}
                      >
                        {room.status === "playing" ? "게임 입장" : "대기방 열기"}
                      </Link>
                    ) : (
                      <GoogleSignInButton
                        className="inline-flex w-full items-center justify-center rounded-full border border-[#d8dee8] bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e293b] md:w-auto"
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
    </main>
  );
}
