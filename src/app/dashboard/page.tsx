"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Code2,
  Star,
  Eye,
  MessageSquare,
  TrendingUp,
  PlusCircle,
  BarChart3,
  Clock,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mockStats = {
  totalProjects: 5,
  totalUpvotes: 156,
  totalViews: 3420,
  totalComments: 28,
  recentProjects: [
    {
      id: "1",
      title: "IoT Weather Station với ESP32",
      status: "APPROVED",
      upvotes: 42,
      viewCount: 1250,
      comments: 15,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Hệ thống tưới cây tự động",
      status: "APPROVED",
      upvotes: 31,
      viewCount: 720,
      comments: 12,
      createdAt: "2024-01-08",
    },
    {
      id: "3",
      title: "Máy đo khoảng cách siêu âm",
      status: "PENDING",
      upvotes: 0,
      viewCount: 0,
      comments: 0,
      createdAt: "2024-01-20",
    },
  ],
};

const statusMap: Record<string, { label: string; variant: any }> = {
  APPROVED: { label: "Đã duyệt", variant: "success" },
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem dashboard</p>
        <Button asChild>
          <a href="/login">Đăng nhập</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Quản lý dự án và theo dõi thống kê</p>
        </div>
        <Button asChild>
          <Link href="/submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            Đăng dự án mới
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng dự án</p>
                <p className="text-2xl font-bold">{mockStats.totalProjects}</p>
              </div>
              <Code2 className="h-8 w-8 text-arduino-teal" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng upvotes</p>
                <p className="text-2xl font-bold">{mockStats.totalUpvotes}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt xem</p>
                <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bình luận</p>
                <p className="text-2xl font-bold">{mockStats.totalComments}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dự án của bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.recentProjects.map((project) => {
              const status = statusMap[project.status] || statusMap.PENDING;
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-medium hover:text-arduino-teal transition-colors truncate"
                      >
                        {project.title}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {project.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {project.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/projects/${project.id}`}>Xem</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
