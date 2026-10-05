"""
Automação de Renderização de Slides HTML5 para PDF 16:9 em Alta Resolução
Utiliza Playwright com Chromium (Microsoft Edge) para gerar PDF vetorial cristalino.
"""
import sys
import os
import time
from playwright.sync_api import sync_playwright

def render_slides_to_pdf(html_path, output_pdf_path):
    print(f"[*] Iniciando renderização: {html_path} -> {output_pdf_path}")
    abs_html = os.path.abspath(html_path)
    if not os.path.exists(abs_html):
        raise FileNotFoundError(f"Arquivo HTML não encontrado: {abs_html}")
    
    file_url = f"file:///{abs_html.replace(os.sep, '/')}"
    
    with sync_playwright() as p:
        # Tenta canal msedge nativo ou chrome
        browser = None
        for channel in ["msedge", "chrome"]:
            try:
                browser = p.chromium.launch(channel=channel, headless=True)
                print(f"[+] Navegador iniciado com canal: {channel}")
                break
            except Exception as e:
                print(f"[-] Falha ao iniciar canal {channel}: {e}")
        
        if not browser:
            browser = p.chromium.launch(headless=True)
            print("[+] Navegador iniciado com Chromium padrão")
            
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2  # Renderização Retina / 2x para nitidez máxima
        )
        page = context.new_page()
        
        print(f"[*] Carregando página: {file_url}")
        page.goto(file_url, wait_until="networkidle")
        
        # Aguarda carregamento de todas as fontes web
        page.evaluate("document.fonts.ready")
        time.sleep(1) # Intervalo para estabilização de renderização e animações/transições
        
        print("[*] Gerando PDF com proporções 1920x1080 px...")
        page.pdf(
            path=output_pdf_path,
            width="1920px",
            height="1080px",
            print_background=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"},
            prefer_css_page_size=True
        )
        
        browser.close()
        print(f"[SUCCESS] PDF gerado com sucesso: {output_pdf_path} ({os.path.getsize(output_pdf_path):,} bytes)")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "treinamento_gold_comfort.html")
    output_file = os.path.join(base_dir, "TREINAMENTO_COMERCIAL_GOLD_COMFORT_IA.pdf")
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
        
    render_slides_to_pdf(input_file, output_file)
