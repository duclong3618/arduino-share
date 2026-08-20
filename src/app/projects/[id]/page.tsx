"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Sample Arduino code for demo
const sampleCode = `// IoT Weather Station với ESP32
// Tác giả: nguyen_van_a
// Phiên bản: 1.0

#include <WiFi.h>
#include <DHT.h>
#include <BlynkSimpleEsp32.h>

// Khai báo chân kết nối
#define DHTPIN 4
#define DHTTYPE DHT22
#define LIGHT_SENSOR_PIN 34

// Thông tin WiFi và Blynk
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";
char auth[] = "YOUR_BLYNK_AUTH_TOKEN";

// Khởi tạo cảm biến DHT
DHT dht(DHTPIN, DHTTYPE);

// Widget Blynk
WidgetLED led1(V0);

void setup() {
  Serial.begin(115200);
  Serial.println("Khởi động Weather Station...");

  // Kết nối WiFi và Blynk
  Blynk.begin(auth, ssid, pass);

  // Khởi tạo cảm biến
  dht.begin();
  pinMode(LIGHT_SENSOR_PIN, INPUT);

  Serial.println("Weather Station sẵn sàng!");
}

void loop() {
  Blynk.run();

  // Đọc dữ liệu cảm biến mỗi 2 giây
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 2000) {
    lastRead = millis();

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    int lightLevel = analogRead(LIGHT_SENSOR_PIN);

    // Kiểm tra lỗi đọc cảm biến
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Lỗi đọc cảm biến DHT!");
      led1.off();
      return;
    }

    led1.on();

    // Gửi dữ liệu lên Blynk
    Blynk.virtualWrite(V1, temperature);
    Blynk.virtualWrite(V2, humidity);
    Blynk.virtualWrite(V3, lightLevel);

    // In ra Serial Monitor
    printSensorData(temperature, humidity, lightLevel);
  }
}

void printSensorData(float temp, float hum, int light) {
  Serial.println("═══════════════════════════════");
  Serial.print("Nhiệt độ: ");
  Serial.print(temp);
  Serial.println(" °C");
  Serial.print("Độ ẩm: ");
  Serial.print(hum);
  Serial.println(" %");
  Serial.print("Ánh sáng: ");
  Serial.println(light);
  Serial.println("═══════════════════════════════");
}`;

const mockProject = {
  id: "1",
  title: "IoT Weather Station với ESP32",
  description: "Trạm thời tiết tự động đo nhiệt độ, độ ẩm và gửi dữ liệu lên cloud. Sử dụng DHT22 và Blynk để theo dõi từ xa qua điện thoại.",
  code: sampleCode,
  boardType: "ESP32",
  difficulty: "INTERMEDIATE",
  hardwareRequirements: `- ESP32 Development Board
- Cảm biến DHT22 (nhiệt độ & độ ẩm)
- Cảm biến ánh sáng (LDR hoặc BH1750)
- Màn hình OLED 0.96" (tùy chọn)
- Breadboard và dây jumper
- Nguồn USB hoặc adapter 5V/2A`,
  usageGuide: `1. **Cài đặt thư viện**: Mở Arduino IDE → Thư viện → Quản lý thư viện → Cài "DHT sensor library" và "Blynk"

2. **Kết nối phần cứng**:
   - Chân DATA của DHT22 → GPIO4 trên ESP32
   - Cảm biến ánh sáng → GPIO34
   - Nối chân VCC và GND appropriately

3. **Cấu hình Blynk**:
   - Tạo tài khoản trên blynk.cloud
   - Tạo Template mới với thiết bị ESP32
   - Lấy Auth Token từ email

4. **Upload code**:
   - Thay YOUR_WIFI_SSID, YOUR_WIFI_PASSWORD
   - Thay YOUR_BLYNK_AUTH_TOKEN
   - Chọn board ESP32 và Upload

5. **Kiểm tra kết quả**:
   - Mở Serial Monitor (115200 baud)
   - Mở app Blynk trên điện thoại
   - Dữ liệu sẽ cập nhật mỗi 2 giây`,
  upvotes: 42,
  viewCount: 1250,
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
  tags: [
    { tag: { name: "IoT", category: "IOT" } },
    { tag: { name: "Cảm biến", category: "SENSOR" } },
    { tag: { name: "WiFi", category: "COMMUNICATION" } },
  ],
  user: { id: "u1", username: "nguyen_van_a", avatarUrl: "", reputation: 156 },
  errors: [
    {
      id: "e1",
      errorMessage: "exit status 1: 'BlynkSimpleEsp32.h': No such file or directory",
      cause: "Thư viện Blynk chưa được cài đặt trong Arduino IDE",
      fix: "Vào Thư viện → Quản lý thư viện → Tìm 'Blynk' → Cài đặt 'Blynk by Volodymyr Shymanskyy'",
      codeSnippet: null,
      upvotes: 28,
    },
    {
      id: "e2",
      errorMessage: "ERROR: Timeout waiting for packet header",
      cause: "ESP32 không kết nối được WiFi hoặc sai SSID/password",
      fix: "Kiểm tra lại tên WiFi và mật khẩu. Đảm bảo WiFi 2.4GHz (ESP32 không hỗ trợ 5GHz).",
      codeSnippet: null,
      upvotes: 22,
    },
    {
      id: "e3",
      errorMessage: "Nan values from DHT sensor",
      cause: "DHT22 chưa có đủ thời gian warm-up hoặc wiring sai",
      fix: "Đợi 2 giây sau khi gọi dht.begin(). Kiểm tra dây DATA có kéo lên resistor 10K không.",
      codeSnippet: "// Thêm delay sau khi khởi tạo\ndht.begin();\ndelay(2000); // Chờ DHT warm-up",
      upvotes: 18,
    },
  ],
  comments: [
    {
      id: "c1",
      content: "Cảm ơn bạn! Mình đã làm theo hướng dẫn và hoạt động tốt. Chỉ có vấn đề nhỏ là cần đợi DHT warm-up.",
      createdAt: "2024-01-18",
      user: { username: "tran_van_b", avatarUrl: "" },
    },
    {
      id: "c2",
      content: "Mình muốn thêm chức năng lưu dữ liệu lên SD card, bạn có thể hướng dẫn thêm được không?",
      createdAt: "2024-01-19",
      user: { username: "le_minh_c", avatarUrl: "" },
    },
    {
      id: "c3",
      content: "Rất hữu ích! Mình đã fork và thêm phần hiển thị OLED. Thanks!",
      createdAt: "2024-01-20",
      user: { username: "pham_thi_d", avatarUrl: "" },
    },
  ],
  versions: [
    { id: "v1", code: "v1 code...", changelog: "Phiên bản đầu tiên", createdAt: "2024-01-15" },
    { id: "v2", code: "v2 code...", changelog: "Thêm cảm biến ánh sáng và tối ưu code", createdAt: "2024-01-18" },
    { id: "v3", code: "v3 code...", changelog: "Sửa lỗi DHT warm-up, thêm error handling", createdAt: "2024-01-20" },
  ],
};

function highlightCode(code: string) {
  // Simple syntax highlighting for Arduino/C++
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(\/\/.*$)/gm,
      '<span class="text-slate-500 italic">$1</span>'
    )
    .replace(
      /(#include\s*<[^>]+>)/g,
      '<span class="text-rose-400">$1</span>'
    )
    .replace(
      /(#define\s+\w+)/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    )
    .replace(
      /\b(void|int|float|char|bool|String|unsigned long|static)\b/g,
      '<span class="text-purple-400">$1</span>'
    )
    .replace(
      /\b(setup|loop|Serial\.begin|Serial\.println|Serial\.print|analogRead|digitalRead|pinMode|delay|millis|isnan)\b/g,
      '<span class="text-sky-400">$1</span>'
    )
    .replace(
      /\b(if|else|return|for|while)\b/g,
      '<span class="text-pink-400 font-semibold">$1</span>'
    )
    .replace(
      /(".*?")/g,
      '<span class="text-emerald-400">$1</span>'
    )
    .replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-amber-400">$1</span>'
    );
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

export default function ProjectDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [upvoted, setUpvoted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("code");

  const project = mockProject;

  const handleCopy = () => {
    navigator.clipboard.writeText(project.code);
    setCopied(true);
    toast({ title: "Đã sao chép code!", variant: "success" as any });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([project.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã tải file .ino!", variant: "success" as any });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground">Dự án</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{project.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
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
              <Badge variant="outline">
                <Cpu className="mr-1 h-3 w-3" />
                {project.boardType}
              </Badge>
              {project.tags.map((pt, i) => (
                <Badge key={i} variant="secondary">
                  <Tag className="mr-1 h-3 w-3" />
                  {pt.tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setUpvoted(!upvoted)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    upvoted ? "text-amber-500" : "hover:text-amber-500"
                  }`}
                >
                  <ArrowUp className={`h-4 w-4 ${upvoted ? "fill-amber-500" : ""}`} />
                  {project.upvotes + (upvoted ? 1 : 0)} upvotes
                </button>
              </TooltipTrigger>
              <TooltipContent>{upvoted ? "Bỏ upvote" : "Upvote dự án"}</TooltipContent>
            </Tooltip>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {project.viewCount} lượt xem
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              {project.comments.length} bình luận
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {new Date(project.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>

          {/* Code Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-arduino-teal">{"</>"}</span>
                  Mã nguồn Arduino
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                    {copied ? "Đã copy" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    .ino
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-[hsl(240,10%,5.5%)] border border-border p-4 text-sm">
                  <code
                    className="font-mono text-slate-300"
                    dangerouslySetInnerHTML={{ __html: highlightCode(project.code) }}
                  />
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Hardware Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-arduino-teal" />
                Yêu cầu phần cứng
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
                <BookOpen className="h-5 w-5 text-arduino-teal" />
                Hướng dẫn sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {project.usageGuide.split("\n\n").map((step, i) => {
                  const lines = step.trim().split("\n");
                  const title = lines[0].replace(/^\d+\.\s*\*\*/, "").replace(/\*\*/, "");
                  const content = lines.slice(1).join("\n").trim();
                  return (
                    <AccordionItem key={i} value={`step-${i}`}>
                      <AccordionTrigger className="text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="arduino" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {i + 1}
                          </Badge>
                          {title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-7 text-sm text-muted-foreground whitespace-pre-line">
                          {content || "Xem chi tiết trong phần code."}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* Errors & Fixes */}
          <Card className="border-error-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Lỗi thường gặp & Cách sửa ({project.errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.errors.map((error) => (
                <div key={error.id} className="rounded-lg border border-error-border bg-error-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-sm font-mono text-red-400 break-all">
                      {error.errorMessage}
                    </code>
                    <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      {error.upvotes}
                    </Button>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium text-muted-foreground">Nguyên nhân: </span>
                    {error.cause}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-emerald-400">Cách sửa: </span>
                    {error.fix}
                  </p>
                  {error.codeSnippet && (
                    <pre className="mt-2 overflow-x-auto rounded bg-background/50 p-3 text-xs font-mono">
                      {error.codeSnippet}
                    </pre>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-arduino-teal" />
                Bình luận ({project.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment form */}
              {session ? (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>{(session.user?.name || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Viết bình luận... Hỗ trợ Markdown cơ bản"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button size="sm" className="mt-2" disabled={!commentText.trim()}>
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

              {/* Comments list */}
              {project.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user.avatarUrl || ""} />
                    <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                      </span>
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
          {/* Author Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.user.avatarUrl || ""} />
                  <AvatarFallback>{project.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/profile/${project.user.username}`}
                    className="font-medium hover:text-arduino-teal transition-colors"
                  >
                    {project.user.username}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {project.user.reputation} điểm uy tín
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử phiên bản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.versions.map((version, i) => (
                  <div key={version.id} className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full bg-arduino-teal" />
                      {i < project.versions.length - 1 && (
                        <div className="absolute left-1/2 top-3 h-full w-px bg-border -translate-x-1/2" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">v{project.versions.length - i}</p>
                      <p className="text-xs text-muted-foreground">{version.changelog}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Thông tin nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Board</span>
                <Badge variant="outline">{project.boardType}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Độ khó</span>
                <DifficultyBadge difficulty={project.difficulty} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span>{new Date(project.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cập nhật</span>
                <span>{new Date(project.updatedAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
