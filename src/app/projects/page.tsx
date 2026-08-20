"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Eye,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIFFICULTIES = [
  { value: "BEGINNER", label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung bình" },
  { value: "ADVANCED", label: "Nâng cao" },
];

const BOARDS = [
  { value: "UNO", label: "Arduino Uno" },
  { value: "MEGA", label: "Arduino Mega" },
  { value: "NANO", label: "Arduino Nano" },
  { value: "ESP32", label: "ESP32" },
  { value: "ESP8266", label: "ESP8266" },
];

const CATEGORIES = [
  { value: "SENSOR", label: "Cảm biến" },
  { value: "MOTOR", label: "Động cơ" },
  { value: "IOT", label: "IoT" },
  { value: "DISPLAY", label: "Màn hình" },
  { value: "COMMUNICATION", label: "Giao tiếp" },
  { value: "LED", label: "LED" },
  { value: "AUDIO", label: "Âm thanh" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Mới nhất" },
  { value: "upvotes", label: "Nhiều upvote" },
  { value: "views", label: "Nhiều lượt xem" },
];

interface Project {
  id: string;
  title: string;
  description: string;
  boardType: string;
  difficulty: string;
  upvotes: number;
  viewCount: number;
  createdAt: string;
  tags: { tag: { name: string } }[];
  user: { username: string };
  _count: { comments: number; errors: number };
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

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all");
  const [board, setBoard] = useState(searchParams.get("board") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (difficulty !== "all") params.set("difficulty", difficulty);
        if (board !== "all") params.set("board", board);
        if (category !== "all") params.set("category", category);
        params.set("sort", sort);
        params.set("page", page.toString());
        params.set("limit", "12");

        const res = await fetch(`/api/projects?${params.toString()}`);
        const data = await res.json();
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } catch (e) {
        console.error("Failed to fetch projects:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [search, difficulty, board, category, sort, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dự án Arduino</h1>
        <p className="text-muted-foreground mt-1">Khám phá và học hỏi từ cộng đồng Arduino</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm dự án theo tên, mô tả, linh kiện..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><Filter className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="Độ khó" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {DIFFICULTIES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={board} onValueChange={(v) => { setBoard(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Board" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {BOARDS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Thể loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">Tìm thấy {total} dự án</p>

      {loading ? (
        <div className="flex py-16 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors">{project.title}</Link>
                    </CardTitle>
                    <DifficultyBadge difficulty={project.difficulty} />
                  </div>
                  <CardDescription className="line-clamp-2 text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs"><Code2 className="mr-1 h-3 w-3" />{project.boardType}</Badge>
                    {project.tags.slice(0, 3).map((pt, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{pt.tag.name}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{project.upvotes}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{project.viewCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{project._count.comments}</span>
                    </div>
                    <span>{project.user.username}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Không tìm thấy dự án</h3>
          <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex py-16 justify-center"><Loader2 className="h-8 w-8 animate-spin text-arduino-teal" /></div>}>
      <ProjectsContent />
    </Suspense>
  );
}
