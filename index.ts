import { Hono } from 'hono'
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"
import { OpenAI } from "https://deno.land/x/openai@v4.49.1/mod.ts";

// アプリケーションの作成
const app = new Hono()
const url = "https://api-data.line.me/v2/bot/message/"
const SYSTEM_PROMPT = "このシステムは画像に写っている食事内容を分析して、どんな食事メニューが画像の中にあるのか検出し、どれだけのカロリーかを推測し、最後に総カロリー量を出力します。分析結果は日本語で回答します。"
const USER_PROMPT = "画像の中には食べ物が映っていますか？その場合、必ず食べ物のカロリーと、それぞれを足し合わせた総カロリー量を教えてください。"

app.post('/webhook', async c => {
  await load({ export: true })
  const data = await c.req.json()
  const replies: Promise<Response>[] = []
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  let ChatGPTAnswer

  for (const event of data.events) {
    console.log('data', data)
    if (event.message.type === 'image') {
      const fetcher = () => fetch(`${url}${event.message.id}/content`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + Deno.env.get("LINE_TOKEN"),
        }
      });

      let DATA_URI = '';

      fetcher().then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const encodedBase64Image = encodeBase64(uint8Array);
        DATA_URI = `data:image/jpeg;base64,${encodedBase64Image}`;
      }).then(async () => {
        await main();
        await reply();
      }).catch((e) => {
        console.log('error', e);
      });

      async function main() {
        console.log('DATA_URI before OpenAI request:', DATA_URI);  // デバッグ用

        const chatCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: 'system',
              content: `${SYSTEM_PROMPT}`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${USER_PROMPT}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `${DATA_URI}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        });
        ChatGPTAnswer = chatCompletion.choices[0].message.content
      }

      async function reply() {
        const { replyToken } = event

        // テキストイメージの場合、どうするか考える
        // if (message.type !== 'text') return // テキストメッセージでないイベントは無視
        // const textMessage: string = message.text // ユーザーの発言を取得

        const replyData = {
          replyToken,
          messages: [{
            type: "text",
            text: ChatGPTAnswer
          }],
        }

        await replies.push(fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + Deno.env.get("LINE_TOKEN"),
          },
          "body": JSON.stringify(replyData),
        }))
      }
    }
  }
  await Promise.all(replies)

  return c.text('OK')
})

// サーバーを起動
Deno.serve(app.fetch)
