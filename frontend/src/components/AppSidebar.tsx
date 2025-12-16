import { useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from "@/components/mode-toggle";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Home,
    IndianRupee,
    FileText,
    Image as ImageIcon,
    Menu,
    Package,
    MessageSquare,
    Users,
    Gift,
    MapPin,
    Bot,
    Settings,
    Bell
} from 'lucide-react';

const mainMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Sales / Expense', url: '/sales-tracker', icon: IndianRupee },
    { title: 'License Help', url: '/license-help', icon: FileText },
    { title: 'Poster Maker', url: '/poster-maker', icon: ImageIcon },
];

const businessMenuItems = [
    { title: 'Startup Mitra', url: '/startup-mitra', icon: Bot },
    { title: 'ChefGuru', url: '/chef-guru', icon: Bot },
    { title: 'Inventory', url: '/inventory', icon: Package },
    { title: 'Reviews', url: '/reviews', icon: MessageSquare },
    { title: 'Community Hub', url: '/community-hub', icon: Users },
    { title: 'Tourism', url: '/tourism', icon: MapPin },
];

const settingsMenuItems = [
    { title: 'Notifications', url: '/notifications', icon: Bell },
    { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xl">🍛</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-sidebar-foreground">RasoiMitra</h1>
                        <p className="text-xs text-sidebar-foreground/70">रसोई साथी</p>
                        <p className="text-[10px] text-green-400 font-serif italic">"तुमची प्रगती, आमचे ध्येय"</p>
                    </div>
                </div>
                <div className="ml-auto">
                    <ModeToggle />
                </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                {/* Quick Access */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
                        Quick Access
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainMenuItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        onClick={() => navigate(item.url)}
                                        isActive={location.pathname === item.url}
                                        className="h-11 gap-3"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Business Tools */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
                        Business Tools
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {businessMenuItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        onClick={() => navigate(item.url)}
                                        isActive={location.pathname === item.url}
                                        className="h-10 gap-3"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Settings */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
                        Settings
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsMenuItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        onClick={() => navigate(item.url)}
                                        isActive={location.pathname === item.url}
                                        className="h-10 gap-3"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar >
    );
}

export function MobileSidebarTrigger() {
    return (
        <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
            <Menu className="h-6 w-6" />
        </SidebarTrigger>
    );
}
