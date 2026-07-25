import os
import glob

html_files = glob.glob('*.html')

for file in html_files:
    if file == 'teste-animacoes.html':
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Injetar CSS no final do <head>
    if 'global-animations.css' not in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="global-animations.css">\n</head>')
        modified = True

    # Injetar JS no final do <body>
    if 'global-animations.js' not in content:
        content = content.replace('</body>', '    <script src="global-animations.js"></script>\n</body>')
        modified = True

    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modificado: {file}")
