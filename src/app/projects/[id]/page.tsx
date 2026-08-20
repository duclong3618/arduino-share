"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Star,
  Copy,
  Download,
  Eye,
  MessageSquare,
  Bug,
  Clock,
  ChevronRight,
  Check,
  Tag,
  Cpu,
  ArrowUp,
  History,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArduinoCodeBlock } from "@/components/ui/arduino-code-block";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  code: string;
  boardType: string;
  difficulty: string;
  hardwareRequirements: string;
  usageGuide: string;
  upvotes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: { tag: { name: string } }[];
  user: { id: string; username: string; avatarUrl: string | null; reputation: number };
  errors: { id: string; errorMessage: string; cause: string; fix: string; codeSnippet: string | null; upvotes: number }[];
  comments: { id: string; content: string; createdAt: string; user: { id: string; username: string; avatarUrl: string | null } }[];
  versions: { id: string; changelog: string | null; createdAt: string }[];
  _count: { upvotesList: number; comments: number };
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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProject(data);
      } catch (e) {
        console.error("Failed to load project:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  const handleCopy = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.code);
    setCopied(true);
    toast({ title: "Đã sao chép code!", variant: "success" as any });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!project) return;
    const blob = new Blob([project.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã tải file .ino!", variant: "success" as any });
  };

  const handleUpvote = async () => {
    if (!session) { toast({ title: "Vui lòng đăng nhập", variant: "destructive" as any }); return; }
    try {
      const res = await fetch(`/api/projects/${id}/upvote`, { method: "POST" });
      const data = await res.json();
      setUpvoted(data.upvoted);
      if (project) {
        setProject({ ...project, upvotes: project.upvotes + (data.upvoted ? 1 : -1) });
      }
    } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, content: commentText }),
      });
      if (!res.ok) throw new Error("Failed");
      const newComment = await res.json();
      if (project) {
        setProject({
          ...project,
          comments: [newComment, ...project.comments],
          _count: { ...project._count, comments: project._count.comments + 1 },
        });
      }
      setCommentText("");
      toast({ title: "Đã gửi bình luận!", variant: "success" as any });
    } catch {
      toast({ title: "Gửi bình luận thất bại", variant: "destructive" as any });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-arduino-teal" /></div>;
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy dự án</h1>
        <Button asChild><Link href="/projects">Quay lại danh sách</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground">Dự án</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{project.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{project.title}</h1>
                <p className="mt-2 text-muted-foreground">{project.description}</p>
              </div>
              <DifficultyBadge difficulty={project.difficulty} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline"><Cpu className="mr-1 h-3 w-3" />{project.boardType}</Badge>
              {project.tags.map((pt, i) => (
                <Badge key={i} variant="secondary"><Tag className="mr-1 h-3 w-3" />{pt.tag.name}</Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Tooltip><TooltipTrigger asChild>
              <button onClick={handleUpvote} className={`flex items-center gap-1.5 transition-colors ${upvoted ? "text-amber-500" : "hover:text-amber-500"}`}>
                <ArrowUp className={`h-4 w-4 ${upvoted ? "fill-amber-500" : ""}`} />
                {project.upvotes} upvotes
              </button>
            </TooltipTrigger><TooltipContent>{upvoted ? "Bỏ upvote" : "Upvote"}</TooltipContent></Tooltip>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{project.viewCount} lượt xem</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{project._count.comments} bình luận</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{new Date(project.updatedAt).toLocaleDateString("vi-VN")}</span>
          </div>

          {/* Code */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-arduino-teal">{"</>"}</span>Mã nguồn Arduino
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                    {copied ? "Đã copy" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 h-3.5 w-3.5" />.ino
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ArduinoCodeBlock code={project.code} />
            </CardContent>
          </Card>

          {/* Hardware */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-arduino-teal" />Yêu cầu phần cứng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.hardwareRequirements.split("\n").map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-arduino-teal shrink-0" />
                    <span>{item.replace(/^- /, "")}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Usage Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-arduino-teal" />Hướng dẫn sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {project.usageGuide.split("\n\n").filter(Boolean).map((step, i) => {
                  const lines = step.trim().split("\n");
                  const title = lines[0].replace(/^\d+\.\s*\*\*/, "").replace(/\*\*/, "");
                  const content = lines.slice(1).join("\n").trim();
                  return (
                    <AccordionItem key={i} value={`step-${i}`}>
                      <AccordionTrigger className="text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="arduino" className="h-5 w-5 p-0 flex items-center justify-center text-xs">{i + 1}</Badge>
                          {title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-7 text-sm text-muted-foreground whitespace-pre-line">{content || "Xem chi tiết trong phần code."}</div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* Errors */}
          {project.errors.length > 0 && (
            <Card className="border-error-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-500" />Lỗi thường gặp & Cách sửa ({project.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.errors.map((error) => (
                  <div key={error.id} className="rounded-lg border border-error-border bg-error-card p-4 space-y-2">
                    <code className="text-sm font-mono text-red-400 break-all">{error.errorMessage}</code>
                    <p className="text-sm"><span className="font-medium text-muted-foreground">Nguyên nhân: </span>{error.cause}</p>
                    <p className="text-sm"><span className="font-medium text-emerald-400">Cách sửa: </span>{error.fix}</p>
                    {error.codeSnippet && (
                      <pre className="mt-2 overflow-x-auto rounded bg-background/50 p-3 text-xs font-mono">{error.codeSnippet}</pre>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-arduino-teal" />Bình luận ({project.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>{(session.user?.name || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea placeholder="Viết bình luận..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="min-h-[80px]" />
                    <Button size="sm" className="mt-2" onClick={handleComment} disabled={!commentText.trim() || submittingComment}>
                      {submittingComment ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                      Gửi bình luận
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  <Link href="/login" className="text-arduino-teal hover:underline">Đăng nhập</Link> để bình luận
                </p>
              )}
              <Separator />
              {project.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user.avatarUrl || ""} />
                    <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user.username}</span>
                      <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.user.avatarUrl || ""} />
                  <AvatarFallback>{project.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${project.user.username}`} className="font-medium hover:text-arduino-teal transition-colors">{project.user.username}</Link>
                  <p className="text-xs text-muted-foreground">⭐ {project.user.reputation} điểm uy tín</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.versions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" />Lịch sử phiên bản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.versions.map((version, i) => (
                    <div key={version.id} className="flex items-start gap-3">
                      <div className="relative">
                        <div className="h-3 w-3 rounded-full bg-arduino-teal" />
                        {i < project.versions.length - 1 && <div className="absolute left-1/2 top-3 h-full w-px bg-border -translate-x-1/2" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium">v{project.versions.length - i}</p>
                        <p className="text-xs text-muted-foreground">{version.changelog || "Không có mô tả"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(version.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Thông tin nhanh</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Board</span><Badge variant="outline">{project.boardType}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Độ khó</span><DifficultyBadge difficulty={project.difficulty} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ngày tạo</span><span>{new Date(project.createdAt).toLocaleDateString("vi-VN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cập nhật</span><span>{new Date(project.updatedAt).toLocaleDateString("vi-VN")}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
