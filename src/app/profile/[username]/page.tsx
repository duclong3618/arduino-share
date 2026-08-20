"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Star, Code2, MessageSquare, Calendar, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  username: string;
  avatarUrl: string | null;
  reputation: number;
  createdAt: string;
  badges: { badge: { name: string; icon: string; description: string } }[];
  projects: {
    id: string; title: string; description: string; boardType: string; difficulty: string;
    upvotes: number; createdAt: string;
    tags: { tag: { name: string } }[];
    _count: { comments: number; upvotesList: number };
  }[];
  _count: { projects: number; comments: number };
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    BEGINNER: { label: "Cơ bản", variant: "beginner" },
    INTERMEDIATE: { label: "Trung bình", variant: "intermediate" },
    ADVANCED: { label: "Nâng cao", variant: "advanced" },
  };
  const { label, variant } = map[difficulty] || map.BEGINNER;
  return <Badge variant={variant}>{label}</Badge>;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-arduino-teal" /></div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy người dùng</h1>
        <Link href="/" className="text-arduino-teal hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatarUrl || ""} />
          <AvatarFallback className="text-2xl">{profile.username[0].toUpperCase()}</AvatarFallback>
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

      {profile.badges.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />Huy hiệu ({profile.badges.length})
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code2 className="h-5 w-5" />Dự án ({profile.projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.projects.length > 0 ? profile.projects.map((project) => (
            <div key={project.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">
                    <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors">{project.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-xs">{project.boardType}</Badge>
                    <DifficultyBadge difficulty={project.difficulty} />
                    {project.tags.map((pt, i) => <Badge key={i} variant="secondary" className="text-xs">{pt.tag.name}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{project.upvotes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{project._count.comments}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center">
              <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Chưa có dự án nào</h3>
              <p className="text-muted-foreground mt-1">
                <Link href="/submit" className="text-arduino-teal hover:underline">Đăng dự án đầu tiên</Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
