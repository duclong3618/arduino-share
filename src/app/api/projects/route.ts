import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  code: z.string().min(10),
  boardType: z.enum(["UNO", "MEGA", "NANO", "ESP32", "ESP8266", "LEONARDO", "DUE", "OTHER"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  hardwareRequirements: z.string().min(5),
  usageGuide: z.string().min(10),
  wiringDiagramUrl: z.string().url().optional(),
  tags: z.array(z.string()).min(1).max(10),
  errors: z.array(z.object({
    errorMessage: z.string(),
    cause: z.string(),
    fix: z.string(),
    codeSnippet: z.string().optional(),
  })).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const board = searchParams.get("board") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "recent";

    const where: any = { status: "APPROVED" };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (difficulty) where.difficulty = difficulty;
    if (board) where.boardType = board;

    if (category) {
      where.tags = {
        some: {
          tag: { category },
        },
      };
    }

    const orderBy: any = (() => {
      switch (sort) {
        case "upvotes": return { upvotes: "desc" };
        case "views": return { viewCount: "desc" };
        default: return { createdAt: "desc" };
      }
    })();

    const [projects, total] = await Promise.all([
      prismadb.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true, errors: true },
          },
        },
      }),
      prismadb.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đăng dự án" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const body = await req.json();
    const validated = projectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { tags, errors, ...projectData } = validated.data;
    const slug = slugify(projectData.title) + "-" + Date.now().toString(36);

    const project = await prismadb.project.create({
      data: {
        ...projectData,
        slug,
        userId,
        tags: {
          create: tags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: {
                  name: tagName,
                  category: "OTHER",
                },
              },
            },
          })),
        },
        errors: errors
          ? {
              create: errors.map((e) => ({
                errorMessage: e.errorMessage,
                cause: e.cause,
                fix: e.fix,
                codeSnippet: e.codeSnippet,
              })),
            }
          : undefined,
        versions: {
          create: {
            code: projectData.code,
            changelog: "Phiên bản đầu tiên",
          },
        },
      },
      include: {
        tags: { include: { tag: true } },
        errors: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
