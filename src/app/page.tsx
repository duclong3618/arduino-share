"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Search,
  Terminal,
  Cpu,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

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
  const map: Record<string, { label: string; colorClass: string }> = {
    BEGINNER: { label: "Cơ bản", colorClass: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    INTERMEDIATE: { label: "Trung bình", colorClass: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    ADVANCED: { label: "Nâng cao", colorClass: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  };
  const { label, colorClass } = map[difficulty] || map.BEGINNER;
  return <Badge variant="secondary" className={`${colorClass} border-transparent`}>{label}</Badge>;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, errRes] = await Promise.all([
          fetch("/api/projects?limit=4&sort=upvotes"),
          fetch("/api/errors?limit=4"),
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/projects?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-20 border-b border-border">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            
            {/* Left Col */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <Badge variant="outline" className="mb-6 self-center lg:self-start px-3 py-1.5 text-sm bg-arduino-teal/10 text-arduino-teal border-arduino-teal/20 backdrop-blur-sm">
                <Zap className="mr-2 h-4 w-4" />
                Nền tảng mã nguồn mở Arduino Hub
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem] leading-tight text-foreground">
                Thư viện Code & <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-arduino-teal to-blue-500">
                  Giải pháp IoT
                </span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto lg:mx-0">
                Hàng ngàn code mẫu, sơ đồ mạch và từ điển sửa lỗi từ cộng đồng. Giúp dự án Arduino của bạn hoàn thiện nhanh hơn bao giờ hết.
              </p>
              
              <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto lg:mx-0 items-center space-x-2 mb-8 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Tìm cảm biến, lỗi, dự án..." 
                    className="pl-11 h-14 bg-background/50 backdrop-blur-md border-border focus-visible:ring-arduino-teal text-base shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 bg-arduino-teal hover:bg-arduino-teal/90 text-white shadow-md">
                  Tìm
                </Button>
              </form>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button asChild variant="outline" className="h-12 px-6 border-border bg-background/50 backdrop-blur-sm hover:bg-accent">
                  <Link href="/projects">Khám phá Code</Link>
                </Button>
                <Button asChild variant="ghost" className="h-12 px-6 hover:bg-error-card text-muted-foreground hover:text-foreground">
                  <Link href="/errors">Tra cứu Lỗi</Link>
                </Button>
              </div>
            </div>

            {/* Right Col: Mock IDE */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-xl border border-border bg-[#1e1e1e] shadow-2xl overflow-hidden group">
                <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="ml-4 flex items-center text-xs text-gray-400 font-mono">
                    <Terminal className="mr-2 h-3 w-3" />
                    main.ino - Arduino IDE
                  </div>
                </div>
                <div className="p-5 overflow-x-auto">
                  <pre className="text-[13px] font-mono leading-relaxed">
                    <code>
<span className="text-[#c678dd]">#include</span> <span className="text-[#98c379]">&lt;LiquidCrystal_I2C.h&gt;</span>
<br/><br/>
<span className="text-[#e5c07b]">LiquidCrystal_I2C</span> <span className="text-[#61afef]">lcd</span>(<span className="text-[#d19a66]">0x27</span>, <span className="text-[#d19a66]">16</span>, <span className="text-[#d19a66]">2</span>);<br/>
<span className="text-[#c678dd]">const int</span> <span className="text-[#e06c75]">sensorPin</span> = <span className="text-[#d19a66]">A0</span>;<br/>
<br/>
<span className="text-[#c678dd]">void</span> <span className="text-[#61afef]">setup</span>() &#123;<br/>
&nbsp;&nbsp;<span className="text-[#e5c07b]">Serial</span>.<span className="text-[#61afef]">begin</span>(<span className="text-[#d19a66]">9600</span>);<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">init</span>();<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">backlight</span>();<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">print</span>(<span className="text-[#98c379]">&quot;System Ready...&quot;</span>);<br/>
&#125;<br/>
<br/>
<span className="text-[#c678dd]">void</span> <span className="text-[#61afef]">loop</span>() &#123;<br/>
&nbsp;&nbsp;<span className="text-[#c678dd]">int</span> <span className="text-[#e06c75]">val</span> = <span className="text-[#56b6c2]">analogRead</span>(<span className="text-[#e06c75]">sensorPin</span>);<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">setCursor</span>(<span className="text-[#d19a66]">0</span>, <span className="text-[#d19a66]">1</span>);<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">print</span>(<span className="text-[#98c379]">&quot;Val: &quot;</span>);<br/>
&nbsp;&nbsp;<span className="text-[#e06c75]">lcd</span>.<span className="text-[#61afef]">print</span>(<span className="text-[#e06c75]">val</span>);<br/>
&nbsp;&nbsp;<span className="text-[#56b6c2]">delay</span>(<span className="text-[#d19a66]">100</span>);<br/>
&#125;
                    </code>
                  </pre>
                </div>
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-arduino-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              
              {/* Decorative glows */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-arduino-teal/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
            </div>
            
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-4xl mx-auto">
            {[
              { label: "Code Mẫu", value: projects.length || "0+", icon: Code2, color: "text-blue-500" },
              { label: "Lỗi Đã Fix", value: errors.length || "0+", icon: AlertTriangle, color: "text-amber-500" },
              { label: "Thành Viên", value: "Đang cập nhật", icon: Users, color: "text-emerald-500" },
              { label: "Lượt Upvote", value: projects.reduce((sum, p) => sum + p.upvotes, 0).toString() || "0", icon: Star, color: "text-purple-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border shadow-sm">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-16 space-y-24">
        
        {/* Featured Projects */}
        <section>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-arduino-teal mb-2">
                <Cpu className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Thư viện Code</h3>
              </div>
              <h2 className="text-3xl font-bold">Dự án Nổi bật</h2>
              <p className="text-muted-foreground mt-2 text-lg">Các đoạn code mẫu chất lượng cao được cộng đồng đánh giá tốt nhất.</p>
            </div>
            <Button asChild variant="outline" className="shrink-0 bg-background hover:bg-accent border-border transition-colors">
              <Link href="/projects">
                Xem tất cả Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-arduino-teal" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-arduino-teal/5 hover:-translate-y-1 bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <CardTitle className="text-xl line-clamp-1">
                          <Link href={`/projects/${project.id}`} className="hover:text-arduino-teal transition-colors focus:outline-none">
                            <span className="absolute inset-0" />
                            {project.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-base">
                          {project.description}
                        </CardDescription>
                      </div>
                      <DifficultyBadge difficulty={project.difficulty} />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-background">{project.boardType}</Badge>
                      {project.tags.map((pt, i) => (
                        <Badge key={i} variant="secondary" className="bg-secondary/50 hover:bg-secondary">{pt.tag.name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                        {project.upvotes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bug className="h-4 w-4" />
                        {project._count.errors}
                      </span>
                    </div>
                    <span className="truncate max-w-[120px]">bởi <span className="text-foreground font-medium">{project.user.username}</span></span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground">Chưa có dự án nào</h3>
                <p className="text-muted-foreground mt-2 mb-4">Trở thành người đầu tiên đóng góp code cho cộng đồng!</p>
                <Button asChild>
                  <Link href="/submit">Đăng dự án đầu tiên</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Trending Errors Section */}
        <section>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Từ điển Sửa Lỗi</h3>
              </div>
              <h2 className="text-3xl font-bold">Lỗi Thường Gặp</h2>
              <p className="text-muted-foreground mt-2 text-lg">Tìm hiểu nguyên nhân và cách khắc phục nhanh chóng các lỗi phổ biến.</p>
            </div>
            <Button asChild variant="outline" className="shrink-0 bg-background hover:bg-error-card border-border hover:border-red-500/30 transition-colors">
              <Link href="/errors">
                Xem tất cả Lỗi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-arduino-teal" />
            </div>
          ) : errors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {errors.map((error) => (
                <Link href={`/projects/${error.project.id}#error-${error.id}`} key={error.id} className="block group focus:outline-none">
                  <Card className="h-full border-border bg-card hover:border-red-500/30 hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="bg-red-500/10 text-red-500 p-2.5 rounded-md font-mono text-sm leading-tight border border-red-500/20 w-full break-all group-hover:bg-red-500/15 transition-colors">
                          {error.errorMessage}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-500 font-medium text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          Nguyên nhân
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{error.cause}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-500 font-medium text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          Cách sửa
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{error.fix}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {error.upvotes}
                      </div>
                      <span className="truncate text-right">
                        Từ: <span className="group-hover:text-foreground transition-colors">{error.project.title}</span>
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Bug className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground">Chưa có báo cáo lỗi nào</h3>
                <p className="text-muted-foreground mt-2">Tuyệt vời! Có vẻ như chưa ai gặp lỗi nào gần đây.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-20 mt-auto border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BookOpen className="mx-auto h-12 w-12 text-arduino-teal" />
            <h2 className="text-3xl font-bold">Chia sẻ kiến thức của bạn</h2>
            <p className="text-muted-foreground text-lg">
              Bạn vừa hoàn thành một dự án hay giải quyết được một lỗi khó chịu? Hãy đóng góp vào thư viện mã nguồn mở để giúp đỡ hàng ngàn lập trình viên khác!
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-foreground text-background hover:bg-foreground/90">
                <Link href="/submit">Bắt đầu đăng dự án</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
