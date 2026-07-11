"use server";

import { prisma } from "@/lib/db";

export async function getExistingCategories() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        AND: [
          { category: { not: null } },
          { category: { not: "" } },
        ],
      },
      distinct: ["category"],
      select: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });
    return posts.map((p) => p.category).filter(Boolean) as string[];
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}
