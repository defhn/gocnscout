import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error("Error: CLERK_WEBHOOK_SECRET is not set in environment variables.");
    return new Response("Error: CLERK_WEBHOOK_SECRET configuration missing", {
      status: 500,
    });
  }

  // 获取头信息
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // 如果没有必要的头，直接报错
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // 获取请求体
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 创建 svix 实例以验证签名
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify Clerk webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Clerk webhook received. Event ID: ${id}, Event Type: ${eventType}`);

  // 处理用户创建和更新事件
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return new Response("Error: No email address found in Clerk payload", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      await prisma.user.upsert({
        where: { clerkId },
        update: {
          email,
          name,
        },
        create: {
          clerkId,
          email,
          name,
        },
      });
    } catch (dbError) {
      console.error("Error syncing user to database in Clerk webhook:", dbError);
      return new Response("Error: Database sync failed", { status: 500 });
    }
  }

  // 处理用户删除事件
  if (eventType === "user.deleted") {
    const { id: clerkId } = evt.data;

    if (!clerkId) {
      return new Response("Error: Missing clerkId in delete event", { status: 400 });
    }

    try {
      // 使用 deleteMany 避免用户记录在本地不存在时抛出 Prisma 报错导致 500
      await prisma.user.deleteMany({
        where: { clerkId },
      });
    } catch (dbError) {
      console.error("Error deleting user in Clerk webhook:", dbError);
      return new Response("Error: Database delete failed", { status: 500 });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
