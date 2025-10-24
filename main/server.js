// server.js (Node.js + Express)
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // HTMLコンテンツを解析・書き換えするためのライブラリ
const app = express();

// Renderは環境変数からポート番号を指定するため、process.env.PORTを使用します
const PORT = process.env.PORT || 3000;

// プロキシ機能のルート
app.get('/proxy', async (req, res) => {
    // ターゲットURLを取得
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Error: "url" query parameter is required.');
    }

    try {
        // 1. ターゲットURLにリクエストを送信
        const response = await axios.get(targetUrl, {
            responseType: 'text',
            // ユーザーエージェントなど、リクエストに必要なヘッダーを設定できます
            headers: {
                'User-Agent': req.headers['user-agent']
            }
        });

        let htmlContent = response.data;
        
        // 2. ★重要: コンテンツ書き換えのロジック（ランマ―ヘッドのコア）
        // Cheerioを使ってHTMLをパースし、全てのリンクとリソースをプロキシ経由に変更
        const $ = cheerio.load(htmlContent);

        // a, link, script, imgなどのURLを書き換え
        $('[href], [src]').each((i, element) => {
            let attr = $(element).is('[href]') ? 'href' : 'src';
            let originalUrl = $(element).attr(attr);

            if (originalUrl && !originalUrl.startsWith('data:')) {
                // 絶対URLの構築（元のホスト名を取得）
                const baseUrl = new URL(targetUrl).origin;
                const absoluteUrl = new URL(originalUrl, baseUrl).href;
                
                // プロキシ経由の新しいURLを構築
                const proxiedUrl = `/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                $(element).attr(attr, proxiedUrl);
            }
        });

        const rewrittenContent = $.html();

        // 3. ヘッダーを設定してレスポンスを返す (CORSを許可する設定も考慮)
        res.header('Access-Control-Allow-Origin', '*'); // どのオリジンからもアクセスを許可
        res.type(response.headers['content-type'] || 'text/html');
        res.send(rewrittenContent);

    } catch (error) {
        console.error("Proxy Fetch Error:", error.message);
        // エラー詳細をユーザーに返さないように注意
        res.status(500).send('Proxy failed to fetch the requested URL.');
    }
});

// 静的ファイルをホストするためのルート (HTML/CSS/JS)
// 既存のHTMLファイルをデプロイする場合に利用
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`RalotPR Proxy server is running on port ${PORT}`);
});
