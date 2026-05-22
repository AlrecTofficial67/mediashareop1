import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use direct Cloudinary upload" }, { status: 400 });
}
