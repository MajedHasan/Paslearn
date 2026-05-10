import AdminSidebar from "@/components/global/sidebar/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart, NewspaperIcon, PlusCircle } from "lucide-react";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
        <div className="max-w-[270px] w-full bg-white border-r border-r-[#E4E7EC] h-screen overflow-y-scroll hidden xl:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col max-h-screen h-full">
          <div className="border-b border-b-[#E4E7EC] bg-white py-3 flex items-center justify-between gap-5 px-3">
            <div className="flex-1">
              <Sheet>
                <SheetTrigger>
                  <BarChart className="xl:hidden block" />
                </SheetTrigger>
                <SheetContent side={"left"} className="overflow-y-scroll">
                  <AdminSidebar />
                </SheetContent>
              </Sheet>
            </div>
            <Input placeholder="Search here..." className="flex-[2]" />
            <div className="flex-1"></div>
          </div>
          <div className="flex-1 max-h-full overflow-y-scroll px-5 py-2">
            <div className="flex items-center justify-between flex-col sm:flex-row mb-4">
              <h1 className="xl:text-2xl text-xl font-semibold">
                Dashboard view
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  className="bg-white text-black hover:text-white border border-slate-400 flex gap-2"
                >
                  <Link href={""}>
                    <PlusCircle size={15} />
                    <span>Use Template</span>
                  </Link>
                </Button>
                <Button asChild className="bg-themeAdminPrimary flex gap-2">
                  <Link href={""}>
                    <NewspaperIcon size={15} />
                    <span>New newsletter</span>
                  </Link>
                </Button>
              </div>
            </div>
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;
