"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  Code2,
  MessageSquare,
  Calendar,
  Award,
  ExternalLink,
  Eye,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockProfile = {
  username: "nguyen_van_a",
  avatarUrl: "",
  reputation: 156,
  createdAt: "2023-06-15",
  badges: [
    { badge: { name: "Người mới", icon: "🌱", description: "Đăng dự án đầu tiên" } },
    { badge: { name: "Giải debugger", icon: "🐛", description: "Giải quyết 5 lỗi" } },
    { badge: { name: "Được yêu thích", icon: "⭐", description: "Đạt 100 upvotes" } },
  ],
  projects: [
    {
      id: "1",
      title: "IoT Weather Station với ESP32",
      description: "Trạm thời tiết tự động đo nhiệt độ, độ ẩm và gửi dữ liệu lên cloud",
      boardType: "ESP32",
      difficulty: "INTERMEDIATE",
      upvotes: 42,
      createdAt: "2024-01-15",
      tags: [{ tag: { name: "IoT" } }, { tag: { name: "Cảm biến" } }],
      _count: { comments: 15, upvotesList: 42 },
    },
    {
      id: "2",
      title: "Hệ thống tưới cây tự động",
      description: "Tự động tưới cây dựa trên độ ẩm đất với cảm biến và bơm nước",
      boardType: "UNO",
      difficulty: "BEGINNER",
      upvotes: 31,
      createdAt: "2024-01-08",
      tags: [{ tag: { name: "IoT" } }],
      _count: { comments: 12, upvotesList: 31 },
    },
  ],
  _count: { projects: 5, comments: 28 },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    BEGINNER: { label: "Cơ bản", variant: "beginner" },
    INTERMEDIATE: { label: "Trung bình", variant: "intermediate" },
    ADVANCED: { label: "Nâng cao", variant: "advanced" },
  };
  const { label, variant } = map[difficulty] || map.BEGINNIER;
  return <Badge variant={variant}>{label}</Badge>;
}

export default function ProfilePage() {
  const params = useParams();
  const profile = mockProfile;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatarUrl || ""} />
          <AvatarFallback className="text-2xl">
            {profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Thành viên từ {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{profile.reputation}</span>
              <span className="text-sm text-muted-foreground">uy tín</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-arduino-teal" />
              <span className="font-semibold">{profile._count.projects}</span>
              <span className="text-sm text-muted-foreground">dự án</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">{profile._count.comments}</span>
              <span className="text-sm text-muted-foreground">bình luận</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Huy hiệu ({profile.badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((ub, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
                  <span className="text-2xl">{ub.badge.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{ub.badge.name}</p>
                    <p className="text-xs text-muted-foreground">{ub.badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            <Code2 className="mr-1 h-3.5 w-3.5" />
            Dự án ({profile.projects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <div className="space-y-4">
            {profile.projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">
                        <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors">
                          {project.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">{project.boardType}</Badge>
                        <DifficultyBadge difficulty={project.difficulty} />
                        {project.tags.map((pt, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{pt.tag.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {project.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {project._count.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {profile.projects.length === 0 && (
            <div className="py-12 text-center">
              <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Chưa có dự án nào</h3>
              <p className="text-muted-foreground mt-1">
                <Link href="/submit" className="text-arduino-teal hover:underline">
                  Đăng dự án đầu tiên
                </Link>
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
