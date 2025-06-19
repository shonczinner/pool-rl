import http.server
import socketserver
import mimetypes
import webbrowser
import threading

PORT = 8000
START_PAGE = "web_client/index.html"  # Change to your game's entry point if needed

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Ensure .js files are served with the correct MIME type
        if self.path.endswith(".js"):
            self.send_header("Content-Type", "application/javascript")
        super().end_headers()

def start_server():
    mimetypes.add_type("application/javascript", ".js")
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # Open the game in the default browser after a short delay
    threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}/{START_PAGE}")).start()
    start_server()
