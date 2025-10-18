import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Macro Mate",
  description: "Login or register to Macro Mate",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9D6FF,#E2E2E2)]"></div>
      </div>
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
