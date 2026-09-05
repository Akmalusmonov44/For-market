import { NextResponse } from "next/server";
import { HttpError } from "@/lib/session";
import { ZodError } from "zod";

/**
 * API route handlerlarni o'rab, har qanday xatoni izchil formatda
 * JSON javobga aylantiradi. Har bir route shu funksiya ichida ishlaydi.
 */
export function withErrorHandling(handler: () => Promise<NextResponse>) {
  return async () => {
    try {
      return await handler();
    } catch (err) {
      return handleError(err);
    }
  };
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ xato: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const birinchi = err.errors[0]?.message || "Ma'lumotlar noto'g'ri.";
    return NextResponse.json(
      { xato: birinchi, tafsilotlar: err.errors },
      { status: 400 },
    );
  }
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
    return NextResponse.json(
      { xato: "Bu ma'lumot allaqachon mavjud (takrorlanish)." },
      { status: 409 },
    );
  }
  // eslint-disable-next-line no-console
  console.error("Kutilmagan server xatosi:", err);
  return NextResponse.json({ xato: "Server xatosi yuz berdi. Qaytadan urinib ko'ring." }, { status: 500 });
}
