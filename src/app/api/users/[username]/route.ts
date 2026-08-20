import { NextResponse } from "next/server";
import prismadb from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prismadb.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        reputation: true,
        createdAt: true,
        badges: {
          include: { badge: true },
        },
        projects: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          include: {
            tags: { include: { tag: true } },
            _count: { select: { comments: true, upvotesList: true } },
          },
        },
        _count: {
          select: { projects: true, comments: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
