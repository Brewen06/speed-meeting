import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api"

export const { GET, POST } = handlers

export { auth as middleware } from "@/lib/auth"
