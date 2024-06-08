# Denoの環境構築

```
curl -fsSL https://deno.land/x/install/install.sh | sh

# 以下を自身のシェルの設定に入れる ex.) .zshrc or .bashrc
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# check install version
deno --version
```

# 技術
・Deno（ランタイム）
・Hono（ルーティング）
・LINE Messaging API
・ChatGPT API

# 実行方法

denoにはPermissionが定義されている。
・read ファイル読み込みを許可
・write ファイル書き込みを許可
・net ネットワークアクセスを許可
・env 環境変数アクセスを許可
・hrtime 高精度時刻へのアクセスを許可
・run 外部コマンド実行を許可
・plugin プラグインの読み込みを許可

開発環境でも、allowする必要があり、下記のようにするとすんなり開発しやすい。

```
deno run --allow-read --allow-write --allow-net --allow-env --watch index.ts
```

参考：https://qiita.com/kt3k/items/53174d45304f3a7d6ddb

# Deno デプロイ先
https://dash.deno.com/projects/deno-line-messaging-api
beta版なので、変わる恐れあり。

# LINE Messaging API
https://developers.line.biz/console/channel/2005567469
にアクセスできるかどうかを確認すること。必要に応じて、gmailを共有してください。

# ローカル開発に関して
どういう開発の仕方がやりやすいのか模索中だが、現状は
・Ngrokでローカルサーバーを立ち上げ
・Ngrokでの生成URLをLINE Messaging APIのwebhookにセット
・Ngrokのinterface urlでリクエストの確認
を行っている。
