import { NextResponse } from "next/server";
import prismadb from "@/lib/prisma";

export async function GET() {
  try {
    // Test DB connection
    const projectCount = await prismadb.project.count();
    const userCount = await prismadb.user.count();
    const tagCount = await prismadb.tag.count();
    const errorCount = await prismadb.projectError.count();

    // Get first 3 projects
    const sampleProjects = await prismadb.project.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        upvotes: true,
      },
    });

    return NextResponse.json({
      status: "ok",
      databaseUrl: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
      counts: {
        projects: projectCount,
        users: userCount,
        tags: tagCount,
        errors: errorCount,
      },
      sampleProjects,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      databaseUrl: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
    }, { status: 500 });
  }
}
