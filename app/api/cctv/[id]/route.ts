import { authenticateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await authenticateRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedCctv = await prisma.cCTV.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        streamurl: body.streamurl,
        status: body.status,
        thumbnail: body.thumbnail,
      },
    });

    return NextResponse.json(updatedCctv);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await authenticateRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.cCTV.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
