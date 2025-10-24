// server.js (Node.js + Express)
const express = require('express');
const axios = require('axios'); // 外部リクエスト用
const app = express();
const PORT = 3000;

// プロキシ機能のルート
app.get('/proxy', async (req, res) => {
    // 実際には、リクエストからターゲットURLを安全に抽出するロジックが必要
    const targetUrl = req.query.url || 'https://example.com/'; 
    console.log(`Proxying request for: ${targetUrl}`);

    try {
        // ターゲットURLにリクエストを送信
        const response = await axios.get(targetUrl, {
            responseType: 'text', // HTMLとして取得
            // ターゲットにユーザーエージェントを渡すなど、必要なヘッダー設定
        });

        let content = response.data;
        
        // ★重要: コンテンツ書き換えのロジック（例：全ての絶対URLをプロキシ経由に変更）
        // この処理が「ランマ―ヘッド」プロキシのコアになります。
        content = content.replace(/href="\//g, `href="/proxy?url=${targetUrl}/`);

        // ヘッダーを設定してレスポンスを返す
        res.type(response.headers['content-type'] || 'text/html');
        res.send(content);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).send('Proxy failed to fetch the target URL.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
