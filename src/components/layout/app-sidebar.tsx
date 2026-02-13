"use client";

import * as React from "react";
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
} from "@/components/ui/sidebar";
import {
  MessageSquare,
  Workflow,
  Store,
  Settings,
  LayoutDashboard,
  Sparkles,
  Play,
  Wrench,
  Bot,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
      },
      {
        title: "Workflows",
        url: "/workflows",
        icon: Workflow,
      },
      {
        title: "Studio",
        url: "/studio",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Marketplace",
        url: "/marketplace",
        icon: Store,
      },
      {
        title: "Playground",
        url: "/playground",
        icon: Play,
      },
      {
        title: "Builder",
        url: "/builder",
        icon: Wrench,
      },
      {
        title: "Social Autopilot",
        url: "/social-autopilot",
        icon: Bot,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link 
          href="/"
          className="flex items-center gap-2 px-2 py-4 hover:bg-sidebar-accent rounded-lg transition-colors cursor-pointer group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#343434] font-bold group-hover:scale-105 transition-transform">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">Beauto</span>
            <span className="text-xs text-muted-foreground">AI Agent Platform</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={user.email || "User"}>
                <div className="flex items-center gap-2 px-2 py-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs truncate">{user.email}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
