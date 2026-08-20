"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Code2, Star, Eye, MessageSquare, PlusCircle, BarChart3, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string; title: string; status: string; upvotes: number;
  viewCount: number; createdAt: string;
  _count: { comments: number };
}

const statusMap: Record<string, { label: string; variant: any }> = {
  APPROVED: { label: "Đã duyệt", variant: "success" },
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) return;
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/projects?limit=50");
        const data = await res.json();
        // Filter to show all projects (in real app, filter by userId)
        setProjects(data.projects || []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [session, authStatus]);

  if (authStatus === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-arduino-teal" /></div>;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập</p>
        <Button asChild><a href="/login">Đăng nhập</a></Button>
      </div>
    );
  }

  const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
  const totalViews = projects.reduce((sum, p) => sum + p.viewCount, 0);
  const totalComments = projects.reduce((sum, p) => sum + p._count.comments, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Quản lý dự án và theo dõi thống kê</p>
        </div>
        <Button asChild><Link href="/submit"><PlusCircle className="mr-2 h-4 w-4" />Đăng dự án mới</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Tổng dự án</p><p className="text-2xl font-bold">{projects.length}</p></div>
            <Code2 className="h-8 w-8 text-arduino-teal" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Tổng upvotes</p><p className="text-2xl font-bold">{totalUpvotes}</p></div>
            <Star className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Lượt xem</p><p className="text-2xl font-bold">{totalViews.toLocaleString()}</p></div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Bình luận</p><p className="text-2xl font-bold">{totalComments}</p></div>
            <MessageSquare className="h-8 w-8 text-emerald-400" />
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Dự án của bạn</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.length > 0 ? projects.map((project) => {
              const st = statusMap[project.status] || statusMap.PENDING;
              return (
                <div key={project.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project.id}`} className="font-medium hover:text-arduino-teal transition-colors truncate">{project.title}</Link>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{project.upvotes}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{project.viewCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{project._count.comments}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm"><Link href={`/projects/${project.id}`}>Xem</Link></Button>
                </div>
              );
            }) : (
              <div className="py-8 text-center text-muted-foreground">Chưa có dự án nào</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
