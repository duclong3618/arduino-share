"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Search,
  Star,
  Eye,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
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
import { Separator } from "@/components/ui/separator";

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

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    BEGINNER: { label: "Cơ bản", variant: "beginner" },
    INTERMEDIATE: { label: "Trung bình", variant: "intermediate" },
    ADVANCED: { label: "Nâng cao", variant: "advanced" },
  };
  const { label, variant } = map[difficulty] || map.BEGINNER;
  return <Badge variant={variant}>{label}</Badge>;
}

// Mock projects for demo
const mockProjects = [
  {
    id: "1",
    title: "IoT Weather Station với ESP32",
    description: "Trạm thời tiết tự động đo nhiệt độ, độ ẩm và gửi dữ liệu lên cloud. Sử dụng DHT22 và Blynk.",
    boardType: "ESP32",
    difficulty: "INTERMEDIATE",
    upvotes: 42,
    viewCount: 1250,
    createdAt: "2024-01-15",
    tags: [{ tag: { name: "IoT" } }, { tag: { name: "Cảm biến" } }],
    user: { username: "nguyen_van_a", avatarUrl: "" },
    _count: { comments: 15, errors: 3 },
  },
  {
    id: "2",
    title: "Robot điều khiển bằng Bluetooth",
    description: "Xe robot 4 bánh điều khiển qua ứng dụng điện thoại Android với module HC-05.",
    boardType: "UNO",
    difficulty: "BEGINNER",
    upvotes: 38,
    viewCount: 980,
    createdAt: "2024-01-12",
    tags: [{ tag: { name: "Động cơ" } }, { tag: { name: "Bluetooth" } }],
    user: { username: "tran_van_b", avatarUrl: "" },
    _count: { comments: 22, errors: 5 },
  },
  {
    id: "3",
    title: "Màn hình OLED hiển thị cảm biến",
    description: "Hiển thị dữ liệu từ cảm biến DHT11 lên màn hình OLED 0.96 inch qua I2C.",
    boardType: "UNO",
    difficulty: "BEGINNER",
    upvotes: 35,
    viewCount: 870,
    createdAt: "2024-01-10",
    tags: [{ tag: { name: "Màn hình" } }, { tag: { name: "Cảm biến" } }],
    user: { username: "le_minh_c", avatarUrl: "" },
    _count: { comments: 8, errors: 2 },
  },
  {
    id: "4",
    title: "Hệ thống tưới cây tự động",
    description: "Tự động tưới cây dựa trên độ ẩm đất với cảm biến và bơm nước mini.",
    boardType: "UNO",
    difficulty: "BEGINNER",
    upvotes: 31,
    viewCount: 720,
    createdAt: "2024-01-08",
    tags: [{ tag: { name: "IoT" } }, { tag: { name: "Cảm biến" } }],
    user: { username: "pham_thi_d", avatarUrl: "" },
    _count: { comments: 12, errors: 4 },
  },
  {
    id: "5",
    title: "Điều khiển LED từ xa qua WiFi",
    description: "Kiểm soát 8 LED RGB từ trình duyệt web qua WiFi với ESP8266 và WebSocket.",
    boardType: "ESP8266",
    difficulty: "INTERMEDIATE",
    upvotes: 28,
    viewCount: 650,
    createdAt: "2024-01-05",
    tags: [{ tag: { name: "LED" } }, { tag: { name: "WiFi" } }],
    user: { username: "hoang_van_e", avatarUrl: "" },
    _count: { comments: 6, errors: 1 },
  },
  {
    id: "6",
    title: "Máy đo khoảng cách siêu âm",
    description: "Đo khoảng cách bằng cảm biến HC-SR04 và hiển thị kết quả lên LCD 16x2.",
    boardType: "UNO",
    difficulty: "BEGINNER",
    upvotes: 25,
    viewCount: 580,
    createdAt: "2024-01-03",
    tags: [{ tag: { name: "Cảm biến" } }, { tag: { name: "Màn hình" } }],
    user: { username: "nguyen_thi_f", avatarUrl: "" },
    _count: { comments: 5, errors: 2 },
  },
];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all");
  const [board, setBoard] = useState(searchParams.get("board") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filteredProjects = mockProjects.filter((p) => {
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (board !== "all" && p.boardType !== board) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dự án Arduino</h1>
        <p className="text-muted-foreground mt-1">
          Khám phá và học hỏi từ cộng đồng Arduino
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm dự án theo tên, mô tả, linh kiện..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={board} onValueChange={setBoard}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {BOARDS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Tìm thấy {filteredProjects.length} dự án
      </p>

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">
                  <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors">
                    {project.title}
                  </Link>
                </CardTitle>
                <DifficultyBadge difficulty={project.difficulty} />
              </div>
              <CardDescription className="line-clamp-2 text-sm">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-xs">
                  <Code2 className="mr-1 h-3 w-3" />
                  {project.boardType}
                </Badge>
                {project.tags.slice(0, 3).map((pt, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{pt.tag.name}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    {project.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {project.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {project._count.comments}
                  </span>
                </div>
                <span>{project.user.username}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="py-16 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Không tìm thấy dự án</h3>
          <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="default" size="sm">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ProjectsLoading() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsContent />
    </Suspense>
  );
}
