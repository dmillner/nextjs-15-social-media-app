import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";

// Routes that allow public viewing (no login required)
const publicRoutes = [
  '/users/', // User profiles
  '/posts/', // Individual posts
];

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // Check if current route allows public viewing
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Require login for non-public routes
  if (!session.user && !isPublicRoute) {
    redirect("/login");
  }

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          {/* Only show MenuBar for logged in users */}
          {session.user && (
            <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
          )}
          {children}
        </div>
        {/* Only show bottom MenuBar for logged in users */}
        {session.user && (
          <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
        )}
      </div>
    </SessionProvider>
  );
}
