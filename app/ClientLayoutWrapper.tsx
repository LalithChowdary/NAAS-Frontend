"use client";

import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({
  children,
  header,
  footer
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/staff/admin");
  const isDpRoute = pathname?.startsWith("/staff/dp");
  const isStaffRoute = isAdminRoute || isDpRoute;

  return (
    <>
      {!isStaffRoute && header}
      <main className="flex-1 flex flex-col">{children}</main>
      {!isStaffRoute && footer}
    </>
  );
}
