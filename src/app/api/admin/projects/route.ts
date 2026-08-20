import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

// GET - List all projects with status filter (admin/moderator)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const admin = await prismadb.user.findUnique({ where: { id: userId } });
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const projects = await prismadb.project.findMany({
      where: { status: status as any },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, errors: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[ADMIN_PROJECTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Approve/Reject project
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const admin = await prismadb.user.findUnique({ where: { id: userId } });
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, action } = await req.json();

    if (!projectId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const project = await prismadb.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    const updated = await prismadb.project.update({
      where: { id: projectId },
      data: { status: newStatus as any },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    // Award reputation for approved projects
    if (action === "approve") {
      await prismadb.user.update({
        where: { id: project.userId },
        data: { reputation: { increment: 10 } },
      });
    }

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("[ADMIN_PROJECTS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
