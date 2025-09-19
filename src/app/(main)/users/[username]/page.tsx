import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";

interface PageProps {
  params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId?: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: username, // SQLite doesn't support case-insensitive mode
    },
    select: getUserDataSelect(loggedInUserId || ""),
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  const user = await getUser(username, loggedInUser?.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  const user = await getUser(username, loggedInUser?.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser?.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId?: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: loggedInUserId ? user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ) : false,
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      {/* Claim banner for unclaimed profiles */}
      {!user.isClaimed && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center">
          <h3 className="font-semibold text-yellow-800">
            🏆 This is an unclaimed athlete profile
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Are you {user.displayName}? Claim this profile to manage your NIL presence
          </p>
          <a
            href={`/claim?username=${user.username}`}
            className="inline-block mt-2 rounded-lg bg-yellow-600 px-4 py-2 text-white text-sm hover:bg-yellow-700 transition-colors"
          >
            Claim This Profile
          </a>
        </div>
      )}

      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {/* Only show interactive buttons if user is logged in */}
        {loggedInUserId && (
          <>
            {user.id === loggedInUserId ? (
              <EditProfileButton user={user} />
            ) : (
              <FollowButton userId={user.id} initialState={followerInfo} />
            )}
          </>
        )}
        {/* Show login prompt for non-logged in users */}
        {!loggedInUserId && (
          <div className="flex flex-col gap-2">
            <a
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-center hover:bg-primary/90 transition-colors"
            >
              Log in to follow
            </a>
            <a
              href="/signup"
              className="rounded-lg border border-border px-4 py-2 text-center hover:bg-accent transition-colors"
            >
              Sign up
            </a>
          </div>
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
