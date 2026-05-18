import { DEFAULT_CATEGORIES } from "@/lib/constants";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenAI(messages: ChatMessage[], maxTokens = 500): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// Rule-based fallback for categorization
function ruleCategorize(description: string): string {
  const lower = description.toLowerCase();
  const rules: Record<string, string[]> = {
    "Ăn uống": ["cơm", "phở", "bún", "cafe", "coffee", "trà", "ăn", "uống", "nhậu", "bia", "trà sữa", "bánh"],
    "Di chuyển": ["grab", "taxi", "xăng", "xe", "gửi xe", "bus", "vé"],
    "Mua sắm": ["quần", "áo", "giày", "dép", "shopee", "lazada", "mua"],
    "Giải trí": ["phim", "game", "netflix", "spotify", "du lịch", "karaoke"],
    "Hóa đơn": ["điện", "nước", "internet", "wifi", "điện thoại", "thuê"],
    "Sức khỏe": ["thuốc", "bệnh viện", "khám", "gym", "bác sĩ"],
    "Giáo dục": ["học", "sách", "khóa", "course", "udemy"],
  };

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Khác";
}

export async function categorizeTransaction(description: string): Promise<string> {
  const categoryNames = DEFAULT_CATEGORIES.map((c) => c.name).join(", ");

  const result = await callOpenAI([
    {
      role: "system",
      content: `Bạn là AI phân loại chi tiêu. Dựa vào mô tả, trả về ĐÚNG 1 tên danh mục phù hợp nhất. Chỉ trả về tên danh mục, không giải thích. Danh mục: ${categoryNames}`,
    },
    { role: "user", content: description },
  ], 20);

  if (result && DEFAULT_CATEGORIES.some((c) => c.name === result.trim())) {
    return result.trim();
  }

  // Fallback to rule-based
  return ruleCategorize(description);
}

export async function chatWithAI(
  question: string,
  userContext: { totalExpense: number; topCategories: string; recentSummary: string }
): Promise<string> {
  const result = await callOpenAI([
    {
      role: "system",
      content: `Bạn là trợ lý tài chính cá nhân. Trả lời ngắn gọn, thân thiện bằng tiếng Việt. Dữ liệu người dùng:
- Tổng chi tiêu tháng này: ${userContext.totalExpense} VNĐ
- Top danh mục: ${userContext.topCategories}
- Tóm tắt: ${userContext.recentSummary}`,
    },
    { role: "user", content: question },
  ], 300);

  return result ?? "Xin lỗi, AI tạm thời không khả dụng. Vui lòng thử lại sau.";
}

export async function generateInsights(data: {
  totalExpense: number;
  categoryBreakdown: { category: string; total: number }[];
  previousMonthExpense: number;
}): Promise<string> {
  const breakdown = data.categoryBreakdown
    .map((c) => `${c.category}: ${c.total} VNĐ`)
    .join(", ");

  const result = await callOpenAI([
    {
      role: "system",
      content: "Bạn là trợ lý tài chính. Phân tích chi tiêu và đưa ra 2-3 nhận xét ngắn gọn, hữu ích bằng tiếng Việt. Mỗi nhận xét 1 dòng.",
    },
    {
      role: "user",
      content: `Tổng chi tháng này: ${data.totalExpense} VNĐ. Tháng trước: ${data.previousMonthExpense} VNĐ. Chi tiết: ${breakdown}`,
    },
  ], 200);

  return result ?? "Chưa đủ dữ liệu để phân tích. Hãy ghi chép thêm chi tiêu nhé!";
}

export async function suggestBudget(
  categoryBreakdown: { category: string; total: number }[]
): Promise<string> {
  const breakdown = categoryBreakdown
    .map((c) => `${c.category}: ${c.total} VNĐ`)
    .join(", ");

  const result = await callOpenAI([
    {
      role: "system",
      content: "Bạn là trợ lý tài chính. Dựa trên chi tiêu tháng trước, đề xuất ngân sách hợp lý cho tháng tới. Trả lời ngắn gọn bằng tiếng Việt.",
    },
    { role: "user", content: `Chi tiêu tháng trước: ${breakdown}` },
  ], 300);

  return result ?? "Chưa đủ dữ liệu để đề xuất ngân sách.";
}
