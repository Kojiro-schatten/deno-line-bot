import { Hono } from 'hono'
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"

// アプリケーションの作成
const app = new Hono()

app.post('/webhook', async c => {
  await load({ export: true })
  const data = await c.req.json()
  const replies: Promise<Response>[] = []

  for (const event of data.events) {
    console.log('data', data)
    // イベントでループ
    if (event.type !== 'message') {
      console.warn('data', data)
      return
    }

    const { message, replyToken } = event

    if (message.type !== 'text') return // テキストメッセージでないイベントは無視

    const textMessage: string = message.text // ユーザーの発言を取得

    const replyData = {
      replyToken,
      messages: [{
        type: "text",
        text: `あなたはさっき、${textMessage}と言った！`
      }],
    } // リプライするデータを作成
    // console.log(Deno.env.get("LINE_TOKEN"))
    replies.push(fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + Deno.env.get("LINE_TOKEN"),
      },
      "body": JSON.stringify(replyData),
    })) // リプライ
  }
  await Promise.all(replies)

  return c.text('OK')
})

// サーバーを起動
Deno.serve(app.fetch)
