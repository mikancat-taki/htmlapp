# app.py (Python + Flask)
from flask import Flask, request, Response
import requests

app = Flask(__name__)

@app.route('/proxy', methods=['GET', 'POST'])
@app.route('/proxy/<path:url>', methods=['GET', 'POST'])
def proxy_request(url=None):
    # クエリパラメータからターゲットURLを取得
    target_url = request.args.get('url', 'https://example.com/')
    
    # ターゲットURLにリクエストを送信
    resp = requests.request(
        method=request.method,
        url=target_url,
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False
    )

    # ★重要: コンテンツ書き換えのロジック（ランマ―ヘッドのコア）
    # lxmlのようなHTMLパーサーを使うとより正確に書き換えられます
    content = resp.text.replace('href="/', f'href="/proxy?url={target_url}/')

    # レスポンスを構築
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [
        (name, value) for (name, value) in resp.raw.headers.items()
        if name.lower() not in excluded_headers
    ]

    return Response(content, resp.status_code, headers)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
