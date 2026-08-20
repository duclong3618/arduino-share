import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismadb from "@/lib/prisma";

// GET - List all reports
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

    const reports = await prismadb.report.findMany({
      where: { status: status as any },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update report status
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

    const { reportId, status } = await req.json();

    if (!reportId || !["REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    await prismadb.report.update({
      where: { id: reportId },
      data: { status: status as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_REPORTS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
