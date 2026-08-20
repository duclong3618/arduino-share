"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Bug,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface ErrorItem {
  id: string;
  errorMessage: string;
  cause: string;
  fix: string;
  codeSnippet: string | null;
  upvotes: number;
  project: { id: string; title: string };
}

export default function ErrorsPage() {
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchErrors() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("limit", "50");
        const res = await fetch(`/api/errors?${params.toString()}`);
        const data = await res.json();
        setErrors(data.errors || []);
      } catch (e) {
        console.error("Failed to fetch errors:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchErrors();
  }, [search]);

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: "Đã sao chép code snippet!", variant: "success" as any });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bug className="h-8 w-8 text-red-500" />
          Thư viện lỗi Arduino
        </h1>
        <p className="text-muted-foreground mt-2">Tìm kiếm lỗi thường gặp và cách giải quyết từ cộng đồng</p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo thông báo lỗi, nguyên nhân, cách sửa..."
            className="pl-9 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">💡 Mẹo: Copy thông báo lỗi chính xác từ Serial Monitor để tìm kiếm nhanh hơn</p>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">Tìm thấy {errors.length} lỗi</p>

      {loading ? (
        <div className="flex py-16 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
        </div>
      ) : errors.length > 0 ? (
        <div className="space-y-4">
          {errors.map((error) => (
            <Card key={error.id} className="border-error-border bg-error-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs"><Bug className="mr-1 h-3 w-3" />Lỗi</Badge>
                      <span className="text-xs text-muted-foreground">{error.upvotes} xác nhận</span>
                    </div>
                    <code className="block text-sm font-mono text-red-400 break-all leading-relaxed">{error.errorMessage}</code>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Nguyên nhân</p>
                  <p className="text-sm">{error.cause}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-1 uppercase tracking-wider">Cách sửa</p>
                  <p className="text-sm whitespace-pre-line">{error.fix}</p>
                </div>
                {error.codeSnippet && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Code ví dụ</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleCopySnippet(error.codeSnippet!, error.id)}>
                        {copiedId === error.id ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                        Copy
                      </Button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-background/50 border border-border p-3 text-xs font-mono">{error.codeSnippet}</pre>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-error-border/50">
                  <Link href={`/projects/${error.project.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Từ dự án: {error.project.title}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Bug className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Không tìm thấy lỗi</h3>
          <p className="text-muted-foreground mt-1">
            Thử tìm kiếm với từ khóa khác hoặc{" "}
            <Link href="/submit" className="text-arduino-teal hover:underline">đăng dự án mới</Link>{" "}
            với lỗi bạn gặp phải
          </p>
        </div>
      )}
    </div>
  );
}
