import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Image URL is required", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const imageBlob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", imageBlob.type);

    return new NextResponse(imageBlob, { status: 200, headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(`Error fetching image: ${errorMessage}`, {
      status: 500,
    });
  }
}
