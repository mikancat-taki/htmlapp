document.addEventListener('DOMContentLoaded', () => {
    const proxyListElement = document.getElementById('proxy-list');
    const urlInput = document.getElementById('url-input');
    const browseButton = document.getElementById('browse-button');
    const resultFrame = document.getElementById('result-frame');

    // 例としてプロキシのリストを定義します（実際にはバックエンドから取得するのが良いでしょう）
    const proxies = [
        { name: 'プロキシA', address: 'http://proxy.example.com:8080' },
        { name: 'プロキシB', address: 'http://another-proxy.net:1080' },
        // 必要に応じて追加
    ];

    let selectedProxy = null;

    // プロキシリストを画面に表示
    proxies.forEach(proxy => {
        const li = document.createElement('li');
        li.textContent = proxy.name;
        li.dataset.address = proxy.address;
        li.addEventListener('click', () => {
            // 他の選択を解除
            document.querySelectorAll('#proxy-list li').forEach(item => {
                item.classList.remove('selected');
            });
            // クリックしたものを選択
            li.classList.add('selected');
            selectedProxy = proxy.address;
        });
        proxyListElement.appendChild(li);
    });

    // 閲覧ボタンのクリックイベント
    browseButton.addEventListener('click', async () => {
        const targetUrl = urlInput.value;
        if (!targetUrl || !selectedProxy) {
            alert('URLを入力し、プロキシを選択してください。');
            return;
        }

        // バックエンドにリクエストを送信
        try {
            // バックエンドのURLを指定（例: /browse）
            const response = await fetch(`/browse?url=${encodeURIComponent(targetUrl)}&proxy=${encodeURIComponent(selectedProxy)}`);
            if (!response.ok) {
                throw new Error('ページの取得に失敗しました。');
            }
            const content = await response.text();
            
            // iframeに取得したHTMLを表示
            resultFrame.srcdoc = content;

        } catch (error) {
            console.error('エラー:', error);
            alert('エラーが発生しました。');
        }
    });
});
