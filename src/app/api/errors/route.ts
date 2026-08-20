import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { errorMessage: { contains: search, mode: "insensitive" } },
        { cause: { contains: search, mode: "insensitive" } },
        { fix: { contains: search, mode: "insensitive" } },
      ];
    }

    const [errors, total] = await Promise.all([
      prismadb.projectError.findMany({
        where,
        orderBy: { upvotes: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      prismadb.projectError.count({ where }),
    ]);

    return NextResponse.json({
      errors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[ERRORS_GET]", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { projectId, errorMessage, cause, fix, codeSnippet } = await req.json();

    if (!projectId || !errorMessage || !cause || !fix) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const error = await prismadb.projectError.create({
      data: {
        projectId,
        errorMessage,
        cause,
        fix,
        codeSnippet,
      },
    });

    return NextResponse.json(error, { status: 201 });
  } catch (error) {
    console.error("[ERRORS_POST]", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
