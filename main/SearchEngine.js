// SearchEngine.js (フロントエンド用JavaScript)
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.createElement('form');
    searchForm.innerHTML = `
        <input type="text" id="search-input" placeholder="検索ワードを入力..." style="width: 80%; padding: 10px;">
        <button type="submit" style="padding: 10px;">RalotPR検索</button>
    `;
    // メインのiframeの上にフォームを挿入
    document.getElementById('main').prepend(searchForm);

    const proxyIframe = document.querySelector('#main iframe');

    // フォーム送信時の処理
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('search-input').value;

        if (query) {
            // 例: Google検索の結果をプロキシ経由で表示
            const target = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            
            // Node.js/Pythonサーバーの /proxy エンドポイントを使用
            const proxiedUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(target)}`;
            
            // iframeのsrcをプロキシURLに設定し、結果を表示
            proxyIframe.src = proxiedUrl;
            
            // クリック音を再生 (既存の tapSound を流用)
            document.getElementById('tapSound').play().catch(()=>{});
        }
    });
});
