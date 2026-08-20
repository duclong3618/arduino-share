"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Code2,
  FileCode,
  Cpu,
  BookOpen,
  Bug,
  Tags,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const projectSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(100),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự").max(500),
  code: z.string().min(10, "Code phải có ít nhất 10 ký tự"),
  boardType: z.string().min(1, "Vui lòng chọn board"),
  difficulty: z.string().min(1, "Vui lòng chọn độ khó"),
  hardwareRequirements: z.string().min(5, "Vui lòng nhập yêu cầu phần cứng"),
  usageGuide: z.string().min(10, "Vui lòng nhập hướng dẫn sử dụng"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const BOARD_OPTIONS = [
  { value: "UNO", label: "Arduino Uno" },
  { value: "MEGA", label: "Arduino Mega" },
  { value: "NANO", label: "Arduino Nano" },
  { value: "ESP32", label: "ESP32" },
  { value: "ESP8266", label: "ESP8266" },
  { value: "LEONARDO", label: "Arduino Leonardo" },
  { value: "DUE", label: "Arduino Due" },
  { value: "OTHER", label: "Khác" },
];

const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Cơ bản", description: "Phù hợp cho người mới bắt đầu" },
  { value: "INTERMEDIATE", label: "Trung bình", description: "Cần kiến thức cơ bản về Arduino" },
  { value: "ADVANCED", label: "Nâng cao", description: "Yêu cầu kinh nghiệm lập trình viên nhúng" },
];

const SUGGESTED_TAGS = [
  "Cảm biến", "Động cơ", "IoT", "Màn hình", "LED",
  "Bluetooth", "WiFi", "Servo", "LCD", "OLED",
  "Nhiệt độ", "Độ ẩm", "Ánh sáng", "Âm thanh",
];

const STEPS = [
  { id: 1, title: "Thông tin cơ bản", icon: FileCode },
  { id: 2, title: "Mã nguồn", icon: Code2 },
  { id: 3, title: "Phần cứng", icon: Cpu },
  { id: 4, title: "Hướng dẫn", icon: BookOpen },
  { id: 5, title: "Lỗi & Tags", icon: Bug },
];

interface ErrorEntry {
  errorMessage: string;
  cause: string;
  fix: string;
  codeSnippet: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors_list, setErrorsList] = useState<ErrorEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      boardType: "",
      difficulty: "",
      hardwareRequirements: "",
      usageGuide: "",
    },
  });

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = form;
  const watchedCode = watch("code");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const addError = () => {
    setErrorsList([
      ...errors_list,
      { errorMessage: "", cause: "", fix: "", codeSnippet: "" },
    ]);
  };

  const updateError = (index: number, field: keyof ErrorEntry, value: string) => {
    const updated = [...errors_list];
    updated[index] = { ...updated[index], [field]: value };
    setErrorsList(updated);
  };

  const removeError = (index: number) => {
    setErrorsList(errors_list.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProjectFormData)[] = [];
    if (step === 1) fieldsToValidate = ["title", "description"];
    if (step === 2) fieldsToValidate = ["code"];
    if (step === 3) fieldsToValidate = ["boardType", "difficulty", "hardwareRequirements"];
    if (step === 4) fieldsToValidate = ["usageGuide"];

    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: ProjectFormData) => {
    if (selectedTags.length === 0) {
      toast({ title: "Vui lòng chọn ít nhất 1 tag", variant: "destructive" as any });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: selectedTags,
          errors: errors_list.filter((e) => e.errorMessage),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }

      toast({ title: "Đăng dự án thành công! 🎉", variant: "success" as any });
      router.push("/projects");
    } catch (error: any) {
      toast({ title: error.message || "Đã có lỗi xảy ra", variant: "destructive" as any });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-arduino-teal" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Đăng dự án mới</h1>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để đăng dự án</p>
        <Button asChild>
          <a href="/login">Đăng nhập</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Đăng dự án mới</h1>
      <p className="text-muted-foreground mb-8">Chia sẻ code Arduino của bạn với cộng đồng</p>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
                  step === s.id
                    ? "bg-primary text-primary-foreground"
                    : step > s.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground sm:mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Tiêu đề và mô tả ngắn gọn về dự án</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề dự án *</Label>
                <Input
                  id="title"
                  placeholder="VD: IoT Weather Station với ESP32"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn chức năng và mục đích dự án (10-500 ký tự)"
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                <p className="text-xs text-muted-foreground">{watch("description")?.length || 0}/500</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Code */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Mã nguồn Arduino</CardTitle>
              <CardDescription>Paste code .ino của bạn vào đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="code">Code Arduino *</Label>
                <Textarea
                  id="code"
                  placeholder={`// Paste code Arduino của bạn ở đây\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Your code here\n}`}
                  className="min-h-[300px] font-mono text-sm"
                  {...register("code")}
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {watchedCode?.split("\n").length || 0} dòng • {watchedCode?.length || 0} ký tự
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Hardware */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Phần cứng & Độ khó</CardTitle>
              <CardDescription>Thông tin về board và linh kiện sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Board sử dụng *</Label>
                <Select onValueChange={(v) => setValue("boardType", v)} value={watch("boardType")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn board Arduino" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.boardType && <p className="text-sm text-destructive">{errors.boardType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Độ khó *</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setValue("difficulty", d.value)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        watch("difficulty") === d.value
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-medium text-sm">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </button>
                  ))}
                </div>
                {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hardware">Yêu cầu phần cứng *</Label>
                <Textarea
                  id="hardware"
                  placeholder={`- Arduino Uno\n- Cảm biến DHT22\n- LED RGB\n- Breadboard\n- Dây jumper`}
                  className="min-h-[150px]"
                  {...register("hardwareRequirements")}
                />
                {errors.hardwareRequirements && (
                  <p className="text-sm text-destructive">{errors.hardwareRequirements.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Usage Guide */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng</CardTitle>
              <CardDescription>Hướng dẫn từng bước cho người mới bắt đầu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="guide">Hướng dẫn từng bước *</Label>
                <Textarea
                  id="guide"
                  placeholder={`1. **Cài đặt thư viện**: Mở Arduino IDE → Quản lý thư viện → Tìm và cài đặt...

2. **Kết nối phần cứng**:
   - Chân DATA của DHT → GPIO4
   - Nối VCC, GND

3. **Upload code**:
   - Chọn board trong Tools → Board
   - Nhấn Upload

4. **Kiểm tra**:
   - Mở Serial Monitor
   - Xem kết quả`}
                  className="min-h-[300px]"
                  {...register("usageGuide")}
                />
                {errors.usageGuide && (
                  <p className="text-sm text-destructive">{errors.usageGuide.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  💡 Sử dụng **text** để in đậm, mỗi bước隔一行 trống
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Errors & Tags */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Lỗi thường gặp & Tags</CardTitle>
              <CardDescription>Thêm lỗi đã gặp và gắn tag cho dự án</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tag mới..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground mr-1">Gợi ý:</span>
                  {SUGGESTED_TAGS.filter((t) => !selectedTags.includes(t)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className="text-xs text-destructive">Vui lòng chọn ít nhất 1 tag</p>
                )}
              </div>

              <Separator />

              {/* Errors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Lỗi thường gặp (tùy chọn)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addError}>
                    <PlusCircle className="mr-1 h-3.5 w-3.5" />
                    Thêm lỗi
                  </Button>
                </div>

                {errors_list.map((error, index) => (
                  <div key={index} className="rounded-lg border border-error-border bg-error-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">Lỗi {index + 1}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeError(index)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Thông báo lỗi (copy từ Serial Monitor)"
                      value={error.errorMessage}
                      onChange={(e) => updateError(index, "errorMessage", e.target.value)}
                    />
                    <Input
                      placeholder="Nguyên nhân"
                      value={error.cause}
                      onChange={(e) => updateError(index, "cause", e.target.value)}
                    />
                    <Textarea
                      placeholder="Cách sửa"
                      value={error.fix}
                      onChange={(e) => updateError(index, "fix", e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Textarea
                      placeholder="Code snippet fix (tùy chọn)"
                      value={error.codeSnippet}
                      onChange={(e) => updateError(index, "codeSnippet", e.target.value)}
                      className="min-h-[60px] font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>

          {step < STEPS.length ? (
            <Button type="button" onClick={nextStep}>
              Tiếp theo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Đăng dự án"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
