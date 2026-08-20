import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { projectId, content } = await req.json();

    if (!projectId || !content || content.trim().length < 2) {
      return NextResponse.json(
        { error: "Nội dung bình luận không hợp lệ" },
        { status: 400 }
      );
    }

    const comment = await prismadb.comment.create({
      data: {
        projectId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    // Increase commenter reputation
    await prismadb.user.update({
      where: { id: userId },
      data: { reputation: { increment: 1 } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
