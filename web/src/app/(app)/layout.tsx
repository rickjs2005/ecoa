import { Nav, DesktopNav } from "@/components/nav";
import { SideRail } from "@/components/side-rail";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="w-full flex-1 lg:mx-auto lg:flex lg:max-w-5xl lg:gap-10 lg:px-8">
        <div className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-6">
          <DesktopNav />
          {children}
        </div>
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-8 pt-6">
            <SideRail />
          </div>
        </aside>
      </div>
      <Nav />
    </>
  );
}
