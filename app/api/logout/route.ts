import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const backendBaseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api.easywrite.dev";

export async function POST() {
  try {
    //@ts-ignore
    const authorization = headers().get("Authorization");
    if (authorization) {
      try {
        await fetch(`${backendBaseURL}/api/v1/logout`, {
          method: "DELETE",
          headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
          },
        });
      } catch (backendError) {
        // Log the error but don't block the main logout flow
        console.error("External backend logout failed:", backendError);
      }
    }

    //@ts-ignore
    cookies().set({
      name: "_easywrite_session",
      value: "",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
