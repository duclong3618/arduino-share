"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Bug,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const mockErrors = [
  {
    id: "1",
    errorMessage: "exit status 1: 'class' does not name a type",
    cause: "Thiếu thư viện hoặc khai báo class bị sai vị trí trong code. Thường gặp khi include thư viện sai cách hoặc khai báo biến ở ngoài hàm.",
    fix: "1. Kiểm tra lại vị trí #include phải ở đầu file\n2. Đảm bảo đã cài đúng thư viện qua Library Manager\n3. Kiểm tra lỗi chính tả trong tên thư viện",
    codeSnippet: "// Sai: #include nằm sau hàm setup()\nvoid setup() {}\n#include <Servo.h>\n\n// Đúng: #include ở đầu file\n#include <Servo.h>\nvoid setup() {}",
    upvotes: 28,
    project: { id: "1", title: "IoT Weather Station" },
  },
  {
    id: "2",
    errorMessage: "Compilation error: 'setup' was not declared in this scope",
    cause: "Hàm setup() bị xóa nhầm, viết sai tên (Setup, Setuppp), hoặc bị viết trong namespace sai.",
    fix: "Đảm bảo file .ino có hai hàm:\n- void setup() { ... }\n- void loop() { ... }\nViết đúng chữ thường, không viết hoa chữ cái đầu.",
    codeSnippet: "// Sai:\nvoid Setup() { ... }  // Chữ S hoa\nvoid LOOP() { ... }   // Chữ HOA\n\n// Đúng:\nvoid setup() { ... }\nvoid loop() { ... }",
    upvotes: 24,
    project: { id: "2", title: "Robot Bluetooth" },
  },
  {
    id: "3",
    errorMessage: "Wire library: SDA/SCL not defined",
    cause: "Sai chân I2C hoặc chưa gọi Wire.begin() trong hàm setup(). Mỗi board có chân I2C khác nhau.",
    fix: "1. Gọi Wire.begin() trong setup()\n2. Kiểm tra chân I2C:\n   - Uno: A4 (SDA), A5 (SCL)\n   - Mega: SDA20, SCL21\n   - ESP32: GPIO21 (SDA), GPIO22 (SCL)",
    codeSnippet: "#include <Wire.h>\n\nvoid setup() {\n  Wire.begin();  // Khai báo I2C\n  // Hoặc chỉ định chân:\n  // Wire.begin(21, 22); // ESP32\n  Serial.begin(9600);\n}",
    upvotes: 19,
    project: { id: "3", title: "OLED Display" },
  },
  {
    id: "4",
    errorMessage: "A library is required for this board but cannot be found: SPI.h",
    cause: "Board không hỗ trợ thư viện SPI hoặc chưa chọn đúng board trong IDE.",
    fix: "1. Vào Tools → Board → Chọn đúng loại board\n2. Cài lại core của board:\n   - Arduino AVR Boards\n   - ESP32 by Espressif\n3. Thử cài lại thư viện SPI",
    codeSnippet: null,
    upvotes: 15,
    project: { id: "4", title: "LED Controller" },
  },
  {
    id: "5",
    errorMessage: "sketch too big for board",
    cause: "Code vượt quá bộ nhớ flash của board. Thường gặp với board Uno (32KB flash).",
    fix: "1. Tối ưu code: xóa debug print không cần thiết\n2. Sử dụng board có bộ nhớ lớn hơn (Mega, ESP32)\n3. Tránh dùng String, dùng char[] thay thế\n4. Tắt Options → Optimize → Smallest (-Os)",
    codeSnippet: "// Tối ưu bộ nhớ:\n// Thay vì dùng String:\nString s = \"Hello\";\n// Dùng char array:\nchar s[] = \"Hello\";",
    upvotes: 12,
    project: { id: "5", title: "Memory Monitor" },
  },
  {
    id: "6",
    errorMessage: "temperature nan, humidity nan from DHT sensor",
    cause: "Cảm biến DHT không phản hồi. Nguyên nhân phổ biến: wiring sai, thiếu pull-up resistor, hoặc chưa đủ thời gian warm-up.",
    fix: "1. Kiểm tra wiring: DATA → GPIO với resistor 10K pull-up\n2. Đợi 2 giây sau dht.begin()\n3. Thử thay đổi DHTTYPE cho đúng model\n4. Kiểm tra nguồn điện (3.3V hoặc 5V tùy model)",
    codeSnippet: "#include <DHT.h>\n\nDHT dht(DHTPIN, DHT22);\n\nvoid setup() {\n  dht.begin();\n  delay(2000); // Quan trọng!\n}",
    upvotes: 10,
    project: { id: "1", title: "IoT Weather Station" },
  },
];

export default function ErrorsPage() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredErrors = mockErrors.filter(
    (e) =>
      !search ||
      e.errorMessage.toLowerCase().includes(search.toLowerCase()) ||
      e.cause.toLowerCase().includes(search.toLowerCase()) ||
      e.fix.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: "Đã sao chép code snippet!", variant: "success" as any });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bug className="h-8 w-8 text-red-500" />
          Thư viện lỗi Arduino
        </h1>
        <p className="text-muted-foreground mt-2">
          Tìm kiếm lỗi thường gặp và cách giải quyết từ cộng đồng
        </p>
      </div>

      {/* Search */}
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
        <p className="mt-2 text-sm text-muted-foreground">
          💡 Mẹo: Copy thông báo lỗi chính xác từ Serial Monitor để tìm kiếm nhanh hơn
        </p>
      </div>

      {/* Results */}
      <p className="mb-4 text-sm text-muted-foreground">
        Tìm thấy {filteredErrors.length} lỗi
      </p>

      <div className="space-y-4">
        {filteredErrors.map((error) => (
          <Card key={error.id} className="border-error-border bg-error-card">
            <CardContent className="pt-6 space-y-4">
              {/* Error message */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="text-xs">
                      <Bug className="mr-1 h-3 w-3" />
                      Lỗi
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {error.upvotes} xác nhận
                    </span>
                  </div>
                  <code className="block text-sm font-mono text-red-400 break-all leading-relaxed">
                    {error.errorMessage}
                  </code>
                </div>
              </div>

              {/* Cause */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  Nguyên nhân
                </p>
                <p className="text-sm">{error.cause}</p>
              </div>

              {/* Fix */}
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-1 uppercase tracking-wider">
                  Cách sửa
                </p>
                <p className="text-sm whitespace-pre-line">{error.fix}</p>
              </div>

              {/* Code snippet */}
              {error.codeSnippet && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code ví dụ
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleCopySnippet(error.codeSnippet!, error.id)}
                    >
                      {copiedId === error.id ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <Copy className="mr-1 h-3 w-3" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-background/50 border border-border p-3 text-xs font-mono">
                    {error.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Source project */}
              <div className="flex items-center justify-between pt-2 border-t border-error-border/50">
                <Link
                  href={`/projects/${error.project.id}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Từ dự án: {error.project.title}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredErrors.length === 0 && (
        <div className="py-16 text-center">
          <Bug className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Không tìm thấy lỗi</h3>
          <p className="text-muted-foreground mt-1">
            Thử tìm kiếm với từ khóa khác hoặc{" "}
            <Link href="/submit" className="text-arduino-teal hover:underline">
              đăng dự án mới
            </Link>{" "}
            với lỗi bạn gặp phải
          </p>
        </div>
      )}
    </div>
  );
}
