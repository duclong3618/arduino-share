import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prismadb.project.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true, reputation: true },
        },
        tags: {
          include: { tag: true },
        },
        errors: true,
        comments: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        versions: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { upvotesList: true, comments: true },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return NextResponse.json(
      { error: "Không tìm thấy dự án" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const existingProject = await prismadb.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }

    const { code, changelog, ...updateData } = body;

    const project = await prismadb.project.update({
      where: { id: params.id },
      data: updateData,
    });

    if (code) {
      await prismadb.projectVersion.create({
        data: {
          projectId: params.id,
          code,
          changelog: changelog || "Cập nhật",
        },
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
