import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockChatHistory, ChatHistoryItem } from "@/lib/chat-history-data";

import {
  Plus,
  History,
  Globe,
  Sparkles,
  Settings,
  LogOut,
  User,
  MessageSquare,
  Trash2,
  Edit3,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const AppSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { title: "New Chat", url: "/", icon: Plus },
    { title: "Explore Countries", url: "/countries", icon: Globe },
    { title: "AI Assistant", url: "/assistant", icon: Sparkles },
  ];

  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-16 px-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-gray-900">AbroadBot</span>
                  <span className="text-xs text-gray-500">Study Abroad Assistant</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="pt-4">
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-11 px-4 text-sm font-medium transition-all rounded-xl",
                        active
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", active && "text-blue-600")} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History List */}
        <SidebarGroup className="">
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4 px-2">
              {mockChatHistory.slice(0, 8).map((chat: ChatHistoryItem) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full justify-start text-left text-sm rounded-lg hover:bg-gray-100 transition-all group",
                      pathname === `/chats/${chat.id}` && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <Link href={`/chats/${chat.id}`} className="flex items-center gap-3 py-2 pr-3">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-900">{chat.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {chat.lastMessage} · {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                        </p>
                      </div>

                      {/* Hover actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto">
                        <button className="p-1 rounded hover:bg-gray-200">
                          <Edit3 className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-200">
                          <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {mockChatHistory.length > 8 && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full text-sm text-gray-600 hover:bg-gray-100 rounded-lg mt-2">
                  <Link href="/chats" className="justify-center">
                    Show all chats →
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User */}
      <SidebarFooter className="border-t border-gray-100 bg-gray-50/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-16 w-full justify-start px-4 hover:bg-gray-100 rounded-xl transition">
                  <Avatar className="h-10 w-10 border-2 border-gray-600 shadow">
                    <AvatarImage src="" />
                    <AvatarFallback className="from-blue-500 to-purple-600 text-gray-600 font-semibold">
                      MU
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left ml-3">
                    <span className="text-sm font-semibold text-gray-900">Md Unus Ali</span>
                    <span className="text-xs text-gray-500">Guest User</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border border-gray-200">
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer rounded-lg">
                  <User className="h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer rounded-lg">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="flex items-center gap-3 text-red-600 focus:text-red-600 cursor-pointer rounded-lg">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;