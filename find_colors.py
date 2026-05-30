import zipfile
import xml.etree.ElementTree as ET
import sys

def find_colors(filepath):
    try:
        with zipfile.ZipFile(filepath) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            found = False
            for p in tree.findall('.//w:p', ns):
                p_text = "".join(t.text for t in p.findall('.//w:t', ns) if t.text)
                if not p_text.strip():
                    continue
                
                for r in p.findall('.//w:r', ns):
                    rPr = r.find('w:rPr', ns)
                    color = None
                    if rPr is not None:
                        color_elem = rPr.find('w:color', ns)
                        if color_elem is not None:
                            color = color_elem.attrib.get(f'{{{ns["w"]}}}val')
                            theme_color = color_elem.attrib.get(f'{{{ns["w"]}}}themeColor')
                            # Sometimes color is not specified by val but themeColor
                            if color is None and theme_color:
                                color = f"theme:{theme_color}"
                    
                    t = r.find('w:t', ns)
                    text = t.text if t is not None else ''
                    
                    if text.strip() and color and color != '000000' and color != 'auto':
                        print(f"File: {filepath.split('/')[-1]}")
                        print(f"Color: {color}")
                        print(f"Paragraph: {p_text.strip()}")
                        print(f"Colored text: {text.strip()}")
                        print("-" * 40)
                        found = True
            if not found:
                print(f"No non-black colors found in {filepath.split('/')[-1]}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

if __name__ == '__main__':
    find_colors('/Users/gadel/Downloads/ХадиевРаильРафилевич_Отчет.docx')
    find_colors('/Users/gadel/Downloads/ХантимировГадельАйдарович_Дневник.docx')
