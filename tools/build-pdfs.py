"""Author tool only. Uses reportlab; the game itself never requires Python."""
from pathlib import Path
from datetime import date
import html,re,os,sys
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,KeepTogether
from pypdf import PdfReader
SELECTED=set(sys.argv[1:])
OUT=Path('output/pdf');OUT.mkdir(parents=True,exist_ok=True)
font=os.environ.get('PIKO_PDF_FONT','/System/Library/Fonts/Supplemental/Arial.ttf')
bold=os.environ.get('PIKO_PDF_FONT_BOLD','/System/Library/Fonts/Supplemental/Arial Bold.ttf')
pdfmetrics.registerFont(TTFont('Body',font));pdfmetrics.registerFont(TTFont('BodyBold',bold))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitlePL',fontName='BodyBold',fontSize=24,leading=29,textColor=colors.HexColor('#172033'),spaceAfter=18))
styles.add(ParagraphStyle(name='HeadingPL',fontName='BodyBold',fontSize=13,leading=17,textColor=colors.HexColor('#176b65'),spaceBefore=14,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyPL',fontName='Body',fontSize=10.2,leading=14.5,textColor=colors.HexColor('#172033'),spaceAfter=8,alignment=TA_LEFT))
styles.add(ParagraphStyle(name='ListPL',parent=styles['BodyPL'],leftIndent=11,firstLineIndent=-8))
def safe(text):
 text=text.replace('–','-').replace('—','-').replace('‑','-').replace('→',' > ').replace('×','x')
 text=html.escape(text)
 text=re.sub(r'`([^`]+)`',r'<b>\1</b>',text)
 text=re.sub(r'\[([^\]]+)\]\((https?://[^ )]+)\)',r'<link href="\2" color="#176b65">\1</link>',text)
 text=re.sub(r'\[([^\]]+)\]\(([^ )]+)\)',r'\1 (\2)',text)
 return text

def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#dce3ef'));canvas.line(48,43,547,43)
 canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#49576d'));canvas.drawString(48,29,'PIKO: MISJA FUNKCJA / 1.0.0 / '+date.today().strftime('%d.%m.%Y'));canvas.drawRightString(547,29,str(doc.page))

def make(name,text):
 if SELECTED and name not in SELECTED:return None
 blocks=text.strip().split('\n\n');story=[]
 for block in blocks:
  block=block.strip()
  if block.startswith('# '):story.append(Paragraph(safe(block[2:]),styles['TitlePL']))
  elif block.startswith('## '):story.append(Paragraph(safe(block[3:]),styles['HeadingPL']))
  elif block.startswith('- ') or re.match(r'^\d+\. ',block):
   for line in block.splitlines():story.append(Paragraph(safe(line),styles['ListPL']))
  else:story.append(Paragraph(safe(block.replace('\n',' ')),styles['BodyPL']))
 SimpleDocTemplate(str(OUT/name),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=60,title='Piko: Misja Funkcja',author='Projekt Piko: Misja Funkcja').build(story,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(OUT/name)
 assert all(p.extract_text().strip() for p in reader.pages)
 print(name,len(reader.pages),'pages')
 return len(reader.pages)
source=Path('docs/11-uruchomienie.md').read_text()
launch='''# Instrukcja uruchomienia

Piko: Misja Funkcja 1.0.0 dla Windows 10/11 (64-bit). Node.js ani Python nie są potrzebne.

## Uruchomienie

1. Rozpakuj cały plik Piko_Misja_Funkcja_1.0.0_Windows_x64.zip do dowolnego folderu (np. na Pulpit). Nie uruchamiaj programu bezpośrednio z archiwum ZIP.
2. W rozpakowanym folderze uruchom Piko Misja Funkcja.exe. Zostaw obok wszystkie pozostałe pliki i folder resources.
3. Jeśli Windows pokaże okno „System Windows ochronił ten komputer”, kliknij Więcej informacji, a potem Uruchom mimo to. Paczka nie ma płatnego podpisu cyfrowego.
4. Kliknij Rozpocznij. Opis gry jest w instrukcji użytkownika.

## Tryb gry

Paczka działa w trybie pokazowym: Piko odpowiada przygotowanymi tekstami, a cała kampania (6 misji) działa bez internetu. Tryb jest zawsze widoczny w prawym górnym rogu. Rozmowy z prawdziwym AI (Claude) pokazuje film. Prawdziwe AI można też uruchomić z kodu źródłowego z własnym kluczem API, według instrukcji kompilacji.

## Postęp

Postęp zapisuje się automatycznie na tym komputerze i zostaje po zamknięciu okna. W Ustawieniach można go usunąć.

## Wersja w przeglądarce

Na dowolnym systemie z Node.js 24: w folderze z kodem wykonaj npm ci, potem npm run dev i otwórz http://127.0.0.1:5173.
'''
make('instrukcja_uruchomienia.pdf',launch)
make('instrukcja_kompilacji.pdf',source)
make('instrukcja_uzytkownika.pdf',Path('docs/12-instrukcja-uzytkownika.md').read_text())
assert make('opis_funkcjonalnosci.pdf',Path('docs/14-opis-funkcjonalnosci.md').read_text()) in (None,1)
make('raport_weryfikacji.pdf',Path('docs/13-raport-weryfikacji.md').read_text())
