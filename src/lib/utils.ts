import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatToolName(toolId: string): string {
  const names: Record<string, string> = {
    cursor: "Cursor",
    github_copilot: "GitHub Copilot",
    claude: "Claude",
    chatgpt: "ChatGPT",
    anthropic_api: "Anthropic API",
    openai_api: "OpenAI API",
    gemini: "Gemini",
    windsurf: "Windsurf",
  };
  return names[toolId] ?? toolId;
}

// Simple in-memory rate limiter for leads endpoint
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) return false; // blocked

  entry.count++;
  return true;
}

export function hashIp(ip: string): string {
  // Simple non-reversible hash for storage
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16);
}
