import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

// GET - List all users (admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const admin = await prismadb.user.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const banned = searchParams.get("banned"); // "true" | "false" | null

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (banned === "true") where.isBanned = true;
    if (banned === "false") where.isBanned = false;

    const users = await prismadb.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        reputation: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        createdAt: true,
        _count: { select: { projects: true, comments: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Ban/Unban user
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const admin = await prismadb.user.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetUserId, action, banReason, role } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }

    // Prevent banning yourself
    if (targetUserId === userId) {
      return NextResponse.json({ error: "Không thể thao tác với chính mình" }, { status: 400 });
    }

    const targetUser = await prismadb.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: any = {};

    if (action === "ban") {
      updateData = {
        isBanned: true,
        banReason: banReason || "Vi phạm quy tắc cộng đồng",
        bannedAt: new Date(),
      };
    } else if (action === "unban") {
      updateData = {
        isBanned: false,
        banReason: null,
        bannedAt: null,
      };
    } else if (action === "setRole" && role) {
      if (!["USER", "MODERATOR", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData = { role };
    }

    const updated = await prismadb.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true, username: true, email: true, role: true,
        isBanned: true, banReason: true, bannedAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
