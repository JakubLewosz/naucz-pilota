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
styles.add(ParagraphStyle(name='HeadingPL',fontName='BodyBold',fontSize=13,leading=17,textColor=colors.HexColor('#2457d6'),spaceBefore=14,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyPL',fontName='Body',fontSize=10.2,leading=14.5,textColor=colors.HexColor('#172033'),spaceAfter=8,alignment=TA_LEFT))
styles.add(ParagraphStyle(name='ListPL',parent=styles['BodyPL'],leftIndent=11,firstLineIndent=-8))
def safe(text):
 text=text.replace('–','-').replace('—','-').replace('‑','-').replace('→',' > ').replace('×','x')
 text=html.escape(text)
 text=re.sub(r'`([^`]+)`',r'<b>\1</b>',text)
 return text

def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#dce3ef'));canvas.line(48,43,547,43)
 canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#49576d'));canvas.drawString(48,29,'NAUCZ PILOTA / 1.0.0 / '+date.today().strftime('%d.%m.%Y'));canvas.drawRightString(547,29,str(doc.page))

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
 SimpleDocTemplate(str(OUT/name),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=60,title='Naucz Pilota',author='Projekt Naucz Pilota').build(story,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(OUT/name)
 assert all(p.extract_text().strip() for p in reader.pages)
 print(name,len(reader.pages),'pages')
 return len(reader.pages)
source=Path('docs/11-uruchomienie.md').read_text()
launch='''# Instrukcja uruchomienia

Naucz Pilota 1.0.0. Aktualna paczka jest demonstracją lokalną; backend live nie został wdrożony.

## Windows x64

1. Rozpakuj cały plik Naucz_Pilota_Windows.zip do własnego folderu.
2. Uruchom Naucz Pilota.exe z rozpakowanego folderu. Zachowaj wszystkie pliki i resources/. Node i Python nie są potrzebne.
3. Etykieta Demo informuje, że odpowiedzi Piko są scenariuszowe. Cała kampania działa bez internetu.
4. Kliknij Zacznij. Szczegóły czterech etapów znajdziesz w instrukcji użytkownika.
5. Zamknij okno. Przy kolejnym uruchomieniu postęp pozostaje na tym urządzeniu. W Ustawieniach możesz usunąć go po potwierdzeniu.

Paczka jest niepodpisana. Test automatyczny w GitHub Actions potwierdził start spakowanego EXE i ponowne otwarcie zapisu na Windows. Odbiór na osobnym komputerze użytkownika pozostaje do wykonania.

## Kod źródłowy na komputerze autora

Wymagany Node 24.x i npm (sprawdzono 24.11.0). W katalogu projektu wykonaj npm ci, potem npm run dev. Otwórz http://127.0.0.1:5173. Zatrzymasz serwer przez Ctrl+C. Python nie jest wymagany do gry.

Po npm run build polecenie npm start udostępnia aplikację na http://127.0.0.1:3001. Przy lokalnym live w tym wariancie ustaw PUBLIC_ORIGIN=http://127.0.0.1:3001. Pełna instrukcja kompilacji opisuje konfigurację backendu i wydania.

## Live i brak sieci

Klucz i model konfiguruje autor wyłącznie na backendzie. Obecna paczka nie ma adresu serwera live. Wersja dla jury wymaga zaufanego originu HTTPS w distribution.json i ponownego builda.

Gdy model jest niedostępny, aplikacja pokazuje błąd i zachowuje wzór oraz wyjaśnienie. Dopiero wybór gracza przełącza na demo. Gra nie udaje odpowiedzi modelu.

## Pierwszy odbiór na Windows

Sprawdź start bez Node, M01 offline, zamknięcie i wznowienie, pierwszą próbę bez podpowiedzi oraz ponowne uruchomienie po korekcie. Po przygotowaniu HTTPS sprawdź live i odłączenie sieci. Zapisz rzeczywisty wynik w raporcie. Nie oznaczaj nieuruchomionego testu jako PASS.
'''
make('instrukcja_uruchomienia.pdf',launch)
make('instrukcja_kompilacji.pdf',source)
make('instrukcja_uzytkownika.pdf',Path('docs/12-instrukcja-uzytkownika.md').read_text())
assert make('opis_funkcjonalnosci.pdf',Path('docs/14-opis-funkcjonalnosci.md').read_text()) in (None,1)
make('raport_weryfikacji.pdf',Path('docs/13-raport-weryfikacji.md').read_text())
