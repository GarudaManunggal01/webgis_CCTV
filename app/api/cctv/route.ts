import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET() {
  try {
    const cameras = await prisma.cCTV.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cameras);
  } catch (error) {
    console.error("Error fetching CCTV data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await authenticateRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, latitude, longitude, streamUrl, status, thumbnail } = body;

    if (!name || !latitude || !longitude || !streamUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique slug using name + timestamp
    const baseSlug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    const newCctv = await prisma.cCTV.create({
      data: {
        name,
        slug,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        streamUrl,
        status: status || "online",
        thumbnail,
      },
    });

    return NextResponse.json(newCctv, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
