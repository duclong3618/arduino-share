"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Bug,
  Star,
  Users,
  Zap,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Project {
  id: string;
  title: string;
  description: string;
  boardType: string;
  difficulty: string;
  upvotes: number;
  tags: { tag: { name: string } }[];
  user: { username: string };
  _count: { comments: number; errors: number };
}

interface ErrorItem {
  id: string;
  errorMessage: string;
  cause: string;
  fix: string;
  upvotes: number;
  project: { id: string; title: string };
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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, errRes] = await Promise.all([
          fetch("/api/projects?limit=4&sort=upvotes"),
          fetch("/api/errors?limit=3"),
        ]);
        const projData = await projRes.json();
        const errData = await errRes.json();
        setProjects(projData.projects || []);
        setErrors(errData.errors || []);
      } catch (e) {
        console.error("Failed to load homepage data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="arduino" className="mb-4">
            <Zap className="mr-1 h-3 w-3" />
            Nền tảng mã nguồn mở
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Chia sẻ mã{" "}
            <span className="text-arduino-teal">Arduino</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Cộng đồng chia sẻ, học hỏi và giải quyết lỗi Arduino. Đăng dự án, tìm lỗi nhanh chóng và cùng nhau phát triển.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/projects">
                Khám phá dự án
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/submit">Đăng dự án mới</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Dự án", value: projects.length || "0+", icon: Code2 },
            { label: "Lỗi đã giải quyết", value: errors.length || "0+", icon: Bug },
            { label: "Thành viên", value: "Đang cập nhật", icon: Users },
            { label: "Lượt upvote", value: projects.reduce((sum, p) => sum + p.upvotes, 0).toString() || "0", icon: Star },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="mx-auto mb-2 h-8 w-8 text-arduino-teal" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Featured Projects */}
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dự án nổi bật</h2>
            <p className="text-muted-foreground">Những dự án được cộng đồng yêu thích nhất</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">
              Xem tất cả
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex py-12 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors">
                          {project.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <DifficultyBadge difficulty={project.difficulty} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{project.boardType}</Badge>
                    {project.tags.map((pt, i) => (
                      <Badge key={i} variant="secondary">{pt.tag.name}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Star className="mr-1 h-3.5 w-3.5 text-amber-500" />
                      {project.upvotes} upvotes
                    </span>
                    <span>{project._count.comments} bình luận</span>
                    <span>bởi {project.user.username}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Code2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="font-semibold">Chưa có dự án nào</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <Link href="/submit" className="text-arduino-teal hover:underline">Đăng dự án đầu tiên!</Link>
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="my-8" />

      {/* Trending Errors */}
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              Lỗi phổ biến
            </h2>
            <p className="text-muted-foreground">Những lỗi thường gặp nhất được cộng đồng giải quyết</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/errors">
              Xem tất cả
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex py-12 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
          </div>
        ) : errors.length > 0 ? (
          <div className="space-y-4">
            {errors.map((error) => (
              <Card key={error.id} className="border-error-border bg-error-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono text-red-400 break-all">{error.errorMessage}</code>
                      <p className="mt-2 text-sm">
                        <span className="font-medium text-muted-foreground">Nguyên nhân:</span>{" "}
                        {error.cause}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="font-medium text-emerald-400">Cách sửa:</span>{" "}
                        {error.fix}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Từ dự án: <Link href={`/projects/${error.project.id}`} className="hover:text-foreground underline">{error.project.title}</Link>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {error.upvotes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bug className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="font-semibold">Chưa có lỗi nào</h3>
              <p className="text-sm text-muted-foreground mt-1">Lỗi từ cộng đồng sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <Card className="bg-arduino-teal/10 border-arduino-teal/25">
          <CardContent className="pt-8 pb-8 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-arduino-teal" />
            <h2 className="text-2xl font-bold mb-2">Đóng góp cho cộng đồng</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bạn đã giải quyết một lỗi thú vị? Hãy chia sẻ để giúp đỡ những người khác!
            </p>
            <Button asChild>
              <Link href="/submit">Đăng dự án ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
