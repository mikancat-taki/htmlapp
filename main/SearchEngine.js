<body>
  <div id="main">
    <form id="search-form" style="text-align: center; margin: 20px auto;">
        <input type="text" id="search-input" placeholder="検索ワードを入力..." style="width: 60%; padding: 10px; border: none; border-radius: 5px;">
        <button type="submit" style="padding: 10px 20px; border: none; border-radius: 5px; background: #00d9ff; color: #363636; cursor: pointer;">RalotPR 検索</button>
    </form>
    
    <iframe id="proxy-iframe" src="about:blank" title="RalotPR Demo" style="width: 100%; height: 90vh;"></iframe>
  </div>

  <audio id="bootSound" src="https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.wav" preload="auto"></audio>
  <audio id="tapSound" src="https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.wav" preload="auto"></audio>

  <script>
    // ... 既存のローディング・起動音のロジックはそのまま ...
    
    // フォーム送信のロジックを新しく追加
    document.addEventListener('DOMContentLoaded', () => {
        // ローディングアニメーション後の表示ロジック
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('main').style.display = 'block';
        }, 4000); 
        
        // フォーム処理
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const proxyIframe = document.getElementById('proxy-iframe');
        const tapSound = document.getElementById('tapSound');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value;

            if (query) {
                // 例: Google検索の結果をプロキシ経由で表示
                const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                
                // ★ポイント: プロキシサーバーのルートパス（/proxy）にターゲットURLを渡す
                // Renderにデプロイすると、自動的にこのサーバーのURLが使われます。
                const proxiedUrl = `/proxy?url=${encodeURIComponent(targetUrl)}`;
                
                proxyIframe.src = proxiedUrl;
                
                tapSound.currentTime = 0;
                tapSound.play().catch(()=>{});
            }
        });

        // クリック時音のロジックはそのまま残す
        document.addEventListener('click', () => {
            tapSound.currentTime = 0;
            tapSound.volume = 0.3;
            tapSound.play().catch(()=>{});
        });
        // ... (touchstart, keydownのロジックもそのまま残す) ...
    });
    // ...
  </script>
</body>
</html>
