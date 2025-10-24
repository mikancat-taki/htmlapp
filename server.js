const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
// Renderが提供するポートを使用
const PORT = process.env.PORT || 8080; 

// フロントエンドの静的ファイルを 'public' フォルダから提供
app.use(express.static(path.join(__dirname, 'public')));

// プロキシ機能のルート
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        // 'url'パラメータがない場合はエラーを返すか、ホームページにリダイレクト
        return res.status(400).send('Error: "url" query parameter is required. Example: /proxy?url=https://www.google.com');
    }
    
    // ユーザーエージェントをそのままターゲットに渡す
    const userAgent = req.headers['user-agent'];

    try {
        // 1. ターゲットURLにリクエストを送信
        const response = await axios.get(targetUrl, {
            responseType: 'text',
            // ターゲットにリクエストヘッダーを渡す
            headers: {
                'User-Agent': userAgent,
                // Accept-Encodingを削除して、コンテンツが圧縮されていない状態で取得
                'Accept-Encoding': 'identity'
            },
            maxRedirects: 0, // リダイレクトを追わない
            validateStatus: (status) => status >= 200 && status < 303 // 3xxリダイレクトは手動で処理
        });

        let htmlContent = response.data;
        const contentType = response.headers['content-type'] || 'text/html';
        
        // 2. HTMLコンテンツの書き換え（Content-TypeがHTMLの場合のみ）
        if (contentType.includes('text/html')) {
            const $ = cheerio.load(htmlContent);
            const baseUrl = new URL(targetUrl).origin;

            // リンク、リソース、フォームアクションなどをプロキシ経由に変更
            $('[href], [src], form').each((i, element) => {
                const $element = $(element);
                let attr;
                let originalUrl;
                
                if ($element.is('form')) {
                    attr = 'action';
                } else {
                    attr = $element.is('[href]') ? 'href' : 'src';
                }
                
                originalUrl = $element.attr(attr);

                if (originalUrl && !originalUrl.startsWith('data:')) {
                    // 絶対URLを構築
                    const absoluteUrl = new URL(originalUrl, baseUrl).href;
                    
                    // プロキシ経由の新しいURLを構築
                    // HTMLのルートパスに戻らず、現在のプロキシの'/proxy'エンドポイントを使用
                    const proxiedUrl = `/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                    
                    $element.attr(attr, proxiedUrl);
                }
            });

            htmlContent = $.html();
        }

        // 3. ヘッダーを設定してレスポンスを返す
        res.type(contentType);
        res.status(response.status);
        res.send(htmlContent);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        
        // エラーレスポンスの処理
        if (error.response) {
            // ターゲットからのレスポンスがある場合（例: 404, 500）
            res.status(error.response.status).send(`Target returned status: ${error.response.status}`);
        } else {
            // ネットワークエラーなど
            res.status(502).send('Proxy failed to connect or fetch the requested URL.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`RalotPR Proxy server is running on port ${PORT}`);
});
