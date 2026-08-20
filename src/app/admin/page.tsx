"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  FileCode,
  AlertTriangle,
  Shield,
  ShieldOff,
  ShieldCheck,
  Ban,
  Check,
  X,
  Search,
  Loader2,
  Eye,
  Clock,
  Trash2,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// ─── Mock data ──────────────────────────────────────────

const mockUsers = [
  { id: "u1", username: "nguyen_van_a", email: "a@gmail.com", role: "USER", reputation: 156, isBanned: false, banReason: null, bannedAt: null, createdAt: "2024-01-15", _count: { projects: 5, comments: 28 } },
  { id: "u2", username: "hacker_ddos_69", email: "spam@evil.com", role: "USER", reputation: 0, isBanned: true, banReason: "DDoS attack / spam submissions", bannedAt: "2024-01-20", createdAt: "2024-01-19", _count: { projects: 0, comments: 150 } },
  { id: "u3", username: "le_minh_c", email: "c@gmail.com", role: "MODERATOR", reputation: 89, isBanned: false, banReason: null, bannedAt: null, createdAt: "2024-01-10", _count: { projects: 3, comments: 15 } },
  { id: "u4", username: "spambot_123", email: "bot@spam.com", role: "USER", reputation: 0, isBanned: true, banReason: "Bot account — automated spam", bannedAt: "2024-01-22", createdAt: "2024-01-21", _count: { projects: 0, comments: 500 } },
];

const mockPendingProjects = [
  { id: "p1", title: "RFID Door Lock với Arduino Uno", description: "Khóa cửa bằng thẻ RFID RC522", boardType: "UNO", difficulty: "BEGINNER", status: "PENDING", createdAt: "2024-01-22", user: { id: "u1", username: "nguyen_van_a", email: "a@gmail.com" }, tags: [{ tag: { name: "RFID" } }], _count: { comments: 0, errors: 0 } },
  { id: "p2", title: "Turtle Robot ESP32", description: "Robot rùa tự đistacles avoidance", boardType: "ESP32", difficulty: "INTERMEDIATE", status: "PENDING", createdAt: "2024-01-23", user: { id: "u5", username: "robot_fan", email: "r@gmail.com" }, tags: [{ tag: { name: "Robot" } }], _count: { comments: 0, errors: 1 } },
];

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge className="bg-red-500/15 text-red-500"><ShieldCheck className="mr-1 h-3 w-3" />Admin</Badge>;
  if (role === "MODERATOR") return <Badge className="bg-blue-500/15 text-blue-500"><Shield className="mr-1 h-3 w-3" />Mod</Badge>;
  return <Badge variant="secondary">User</Badge>;
}

// ─── Admin Page ─────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(mockPendingProjects);
  const [search, setSearch] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Check admin access
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleBanUser = async () => {
    if (!selectedUser) return;
    setLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 500));

    setUsers(users.map(u =>
      u.id === selectedUser.id
        ? { ...u, isBanned: true, banReason, bannedAt: new Date().toISOString() }
        : u
    ));

    toast({ title: `Đã ban ${selectedUser.username}`, variant: "success" as any });
    setBanDialogOpen(false);
    setSelectedUser(null);
    setBanReason("");
    setLoading(false);
  };

  const handleUnbanUser = async (userId: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, isBanned: false, banReason: null, bannedAt: null }
        : u
    ));

    const user = users.find(u => u.id === userId);
    toast({ title: `Đã gỡ ban ${user?.username}`, variant: "success" as any });
    setLoading(false);
  };

  const handleApproveProject = async (projectId: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    setProjects(projects.filter(p => p.id !== projectId));
    toast({ title: "Đã duyệt dự án ✅", variant: "success" as any });
    setLoading(false);
  };

  const handleRejectProject = async (projectId: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    setProjects(projects.filter(p => p.id !== projectId));
    toast({ title: "Đã từ chối dự án ❌", variant: "destructive" as any });
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    bannedUsers: users.filter(u => u.isBanned).length,
    pendingProjects: projects.length,
    moderators: users.filter(u => u.role === "MODERATOR").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
            <ShieldCheck className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Quản lý người dùng & nội dung</p>
          </div>
        </div>
        <Badge variant="destructive">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-arduino-teal" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/25">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang bị ban</p>
                <p className="text-2xl font-bold text-red-500">{stats.bannedUsers}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/25">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pendingProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold">{stats.moderators}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="mr-1 h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FileCode className="mr-1 h-4 w-4" />
            Duyệt dự án ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Báo cáo
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ──────────────────────────────── */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm user theo tên hoặc email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>Xóa tìm kiếm</Button>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={user.isBanned ? "border-red-500/25 bg-red-500/5" : ""}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={user.isBanned ? "bg-red-500/20 text-red-500" : ""}>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{user.username}</span>
                          <RoleBadge role={user.role} />
                          {user.isBanned && (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="mr-1 h-3 w-3" />
                              BANNED
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.isBanned && user.banReason && (
                          <p className="text-xs text-red-400 mt-0.5">
                            Lý do: {user.banReason}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>⭐ {user.reputation}</span>
                          <span>📄 {user._count.projects} dự án</span>
                          <span>💬 {user._count.comments} bình luận</span>
                          <span>📅 {new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(user.id)}
                          disabled={loading}
                        >
                          <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                          Gỡ ban
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/25 text-red-500 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedUser(user);
                            setBanDialogOpen(true);
                          }}
                          disabled={loading || user.role === "ADMIN"}
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Projects Tab ───────────────────────────── */}
        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
                <h3 className="font-semibold">Không có dự án chờ duyệt</h3>
                <p className="text-sm text-muted-foreground">Tất cả đã được xử lý 👍</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge variant="warning">Chờ duyệt</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">{project.boardType}</Badge>
                        <Badge variant={project.difficulty === "BEGINNER" ? "beginner" : project.difficulty === "INTERMEDIATE" ? "intermediate" : "advanced"} className="text-xs">
                          {project.difficulty}
                        </Badge>
                        {project.tags.map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{t.tag.name}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Bởi <span className="font-medium">{project.user.username}</span> ({project.user.email}) • {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/projects/${project.id}`} target="_blank">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Xem
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveProject(project.id)}
                        disabled={loading}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectProject(project.id)}
                        disabled={loading}
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Reports Tab ────────────────────────────── */}
        <TabsContent value="reports">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="font-semibold">Chưa có báo cáo nào</h3>
              <p className="text-sm text-muted-foreground">Khi có reports từ người dùng sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Ban Dialog ──────────────────────────────── */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Ban className="h-5 w-5" />
              Ban người dùng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn ban <strong>{selectedUser?.username}</strong>?
              Người dùng sẽ không thể đăng nhập hoặc đăng nội dung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do ban *</label>
            <Input
              placeholder="VD: DDoS attack, spam submissions, vi phạm quy tắc..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={!banReason.trim() || loading}
            >
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Xác nhận ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
