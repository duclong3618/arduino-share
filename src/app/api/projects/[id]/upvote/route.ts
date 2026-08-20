import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const existingUpvote = await prismadb.upvote.findUnique({
      where: {
        userId_projectId: { userId, projectId: params.id },
      },
    });

    if (existingUpvote) {
      await prismadb.upvote.delete({
        where: { id: existingUpvote.id },
      });

      await prismadb.project.update({
        where: { id: params.id },
        data: { upvotes: { decrement: 1 } },
      });

      return NextResponse.json({ upvoted: false });
    }

    await prismadb.upvote.create({
      data: {
        userId,
        projectId: params.id,
      },
    });

    await prismadb.project.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } },
    });

    // Increase author reputation
    const project = await prismadb.project.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (project) {
      await prismadb.user.update({
        where: { id: project.userId },
        data: { reputation: { increment: 1 } },
      });
    }

    return NextResponse.json({ upvoted: true });
  } catch (error) {
    console.error("[UPVOTE]", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
