import {
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  ChevronLeft,
  ChevronRight,
  AlignJustify,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";


const Navbar = () => {
 
  const { toggleSidebar, open, isMobile } = useSidebar();

  return (
    <div>
      <nav className="fixed w-5/6 z-50 p-4 flex items-center justify-between top-0 bg-background border-b-2 border-dashed border-slate-300/40">

      

        {isMobile ? (
          <Button variant="outline" onClick={toggleSidebar}>
            <AlignJustify className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" onClick={toggleSidebar}>
            {open ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-4 mr-4">
          <a href="/">Md Unus Ali</a>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none focus:ring-0 data-[state=open]:border-0">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-700 text-white">M</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>  
    </div>
  );
};

export default Navbar;
