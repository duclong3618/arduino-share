"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, FileCode, AlertTriangle, Shield, ShieldCheck, Ban, Check, X,
  Search, Loader2, Eye, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string; username: string; email: string; role: string; reputation: number;
  isBanned: boolean; banReason: string | null; bannedAt: string | null;
  createdAt: string; _count: { projects: number; comments: number };
}

interface PendingProject {
  id: string; title: string; description: string; boardType: string; difficulty: string;
  createdAt: string;
  user: { id: string; username: string; email: string };
  tags: { tag: { name: string } }[];
  _count: { comments: number; errors: number };
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge className="bg-red-500/15 text-red-500"><ShieldCheck className="mr-1 h-3 w-3" />Admin</Badge>;
  if (role === "MODERATOR") return <Badge className="bg-blue-500/15 text-blue-500"><Shield className="mr-1 h-3 w-3" />Mod</Badge>;
  return <Badge variant="secondary">User</Badge>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }

    async function fetchData() {
      try {
        const [usersRes, projRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/projects?status=PENDING"),
        ]);
        if (usersRes.ok) {
          const d = await usersRes.json();
          setUsers(d.users || []);
        }
        if (projRes.ok) {
          const d = await projRes.json();
          setProjects(d.projects || []);
        }
      } catch (e) {
        console.error("Admin fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session, status, router]);

  const handleBanUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: selectedUser.id, action: "ban", banReason }),
      });
      if (!res.ok) throw new Error("Failed");
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBanned: true, banReason, bannedAt: new Date().toISOString() } : u));
      toast({ title: `Đã ban ${selectedUser.username}`, variant: "success" as any });
      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    } catch { toast({ title: "Lỗi khi ban user", variant: "destructive" as any }); }
    finally { setActionLoading(false); }
  };

  const handleUnbanUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, action: "unban" }),
      });
      if (!res.ok) throw new Error("Failed");
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false, banReason: null, bannedAt: null } : u));
      const user = users.find(u => u.id === userId);
      toast({ title: `Đã gỡ ban ${user?.username}`, variant: "success" as any });
    } catch { toast({ title: "Lỗi khi gỡ ban", variant: "destructive" as any }); }
    finally { setActionLoading(false); }
  };

  const handleApproveProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed");
      setProjects(projects.filter(p => p.id !== projectId));
      toast({ title: "Đã duyệt dự án ✅", variant: "success" as any });
    } catch { toast({ title: "Lỗi khi duyệt", variant: "destructive" as any }); }
    finally { setActionLoading(false); }
  };

  const handleRejectProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed");
      setProjects(projects.filter(p => p.id !== projectId));
      toast({ title: "Đã từ chối dự án", variant: "destructive" as any });
    } catch { toast({ title: "Lỗi khi từ chối", variant: "destructive" as any }); }
    finally { setActionLoading(false); }
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-arduino-teal" /></div>;
  }
  if (!session) return null;

  const filteredUsers = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const bannedCount = users.filter(u => u.isBanned).length;

  return (
    <div className="container mx-auto px-4 py-8">
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
        <Badge variant="destructive"><ShieldCheck className="mr-1 h-3 w-3" />Admin</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Tổng người dùng</p><p className="text-2xl font-bold">{users.length}</p></div>
            <Users className="h-8 w-8 text-arduino-teal" />
          </div>
        </CardContent></Card>
        <Card className="border-red-500/25"><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Đang bị ban</p><p className="text-2xl font-bold text-red-500">{bannedCount}</p></div>
            <Ban className="h-8 w-8 text-red-500" />
          </div>
        </CardContent></Card>
        <Card className="border-amber-500/25"><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Chờ duyệt</p><p className="text-2xl font-bold text-amber-500">{projects.length}</p></div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Người dùng</TabsTrigger>
          <TabsTrigger value="projects"><FileCode className="mr-1 h-4 w-4" />Duyệt dự án ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm user..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={user.isBanned ? "border-red-500/25 bg-red-500/5" : ""}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={user.isBanned ? "bg-red-500/20 text-red-500" : ""}>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{user.username}</span>
                          <RoleBadge role={user.role} />
                          {user.isBanned && <Badge variant="destructive" className="text-xs"><Ban className="mr-1 h-3 w-3" />BANNED</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.isBanned && user.banReason && <p className="text-xs text-red-400 mt-0.5">Lý do: {user.banReason}</p>}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>⭐ {user.reputation}</span>
                          <span>📄 {user._count.projects} dự án</span>
                          <span>💬 {user._count.comments} bình luận</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {user.isBanned ? (
                        <Button variant="outline" size="sm" onClick={() => handleUnbanUser(user.id)} disabled={actionLoading}>
                          <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" />Gỡ ban
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="border-red-500/25 text-red-500 hover:bg-red-500/10"
                          onClick={() => { setSelectedUser(user); setBanDialogOpen(true); }}
                          disabled={actionLoading || user.role === "ADMIN"}>
                          <Ban className="mr-1 h-3.5 w-3.5" />Ban
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Check className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
              <h3 className="font-semibold">Không có dự án chờ duyệt</h3>
            </CardContent></Card>
          ) : projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant="warning">Chờ duyệt</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bởi <span className="font-medium">{project.user.username}</span> • {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm"><a href={`/projects/${project.id}`} target="_blank"><Eye className="mr-1 h-3.5 w-3.5" />Xem</a></Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveProject(project.id)} disabled={actionLoading}>
                      <Check className="mr-1 h-3.5 w-3.5" />Duyệt
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRejectProject(project.id)} disabled={actionLoading}>
                      <X className="mr-1 h-3.5 w-3.5" />Từ chối
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500"><Ban className="h-5 w-5" />Ban người dùng</DialogTitle>
            <DialogDescription>Bạn có chắc muốn ban <strong>{selectedUser?.username}</strong>?</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do ban *</label>
            <Input placeholder="VD: DDoS attack, spam submissions..." value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Xác nhận ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
