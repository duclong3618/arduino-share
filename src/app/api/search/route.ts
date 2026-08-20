import { NextResponse } from "next/server";
import prismadb from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // "all", "projects", "errors"

    if (!q || q.length < 2) {
      return NextResponse.json({ projects: [], errors: [], tags: [] });
    }

    const searchFilter = {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { code: { contains: q, mode: "insensitive" as const } },
      ],
    };

    const results: any = {};

    if (type === "all" || type === "projects") {
      results.projects = await prismadb.project.findMany({
        where: { status: "APPROVED", ...searchFilter },
        take: 10,
        orderBy: { upvotes: "desc" },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          tags: { include: { tag: true } },
        },
      });
    }

    if (type === "all" || type === "errors") {
      results.errors = await prismadb.projectError.findMany({
        where: {
          OR: [
            { errorMessage: { contains: q, mode: "insensitive" } },
            { cause: { contains: q, mode: "insensitive" } },
            { fix: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { upvotes: "desc" },
        include: {
          project: { select: { id: true, title: true } },
        },
      });
    }

    if (type === "all") {
      results.tags = await prismadb.tag.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: 5,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[SEARCH]", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
