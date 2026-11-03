# Dostarczenie projektu na konkurs

Stan rozpoznania: 2026-11-03. Sprawdź aktualną stronę i załączniki ponownie przed wysłaniem. Ten dokument jest instrukcją przygotowania materiałów, nie potwierdzeniem przyjęcia zgłoszenia.

## Wymagania i źródło
[Strona organizatora](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas) zawiera regulamin i formularze.

Termin kompletnego zgłoszenia: **29 listopada 2026**. Do przekazania są podpisane formularze, kod z instrukcją kompilacji, wersja binarna z instrukcją uruchomienia, instrukcja użytkowania, film AVI/MP4 do 5 minut i opis do 1 strony. Materiały należy umieścić w chmurze, a link wysłać organizatorowi.

Sprawy kwalifikacji autora, zgód opiekuna i podpisów nie są zadaniem Codex. Nie uzupełniaj fikcyjnymi danymi. Przygotuj odpowiednie miejsca w checklistach.

## Pięć obszarów oceny — jak pokazać projekt
Każde z pięciu kryteriów regulaminowych ma zakres 0–10. To mapa projektu do kryteriów, nie przewidywanie punktów ani prywatnych preferencji jurorów.

| Kryterium | Co dostarczamy jako dowód |
|---|---|
| Wartość edukacyjna | Jasne cele sześciu misji, wyjaśnianie zasady, osobne zadanie samodzielne, uczciwy zapis pierwszej próby |
| Innowacyjność i AI | Gracz uczy symulowanego robota; model reaguje na jego wypowiedź i tworzy propozycję trasy na innej planszy |
| Użyteczność i przejrzystość | Zrozumiała plansza, krótkie komunikaty, klawiatura, jasne wskazanie trybu i błędów |
| Poprawność techniczna | Bezpieczny parser, analityczne kolizje, zweryfikowane misje, obsługa awarii, działające wydanie |
| Prezentacja | Film z rzeczywistej gry, zwięzły opis, komplet instrukcji, widoczny wkład AI i autora |

Nie znaleziono wiarygodnych publicznych danych, które pozwalałyby wywnioskować schemat zwycięskich projektów wcześniejszych edycji tego konkretnego konkursu. Strategia opiera się na opublikowanych wymaganiach, a nie wymyślonej historii laureatów.

## Docelowy folder przekazywany organizatorowi
    Naucz_Pilota_zgloszenie/
      01_formularze/
        karta_zgloszenia_podpisana.pdf
        klauzula_informacyjna_podpisana.pdf
      02_aplikacja/
        Naucz_Pilota_Windows.zip
        instrukcja_uruchomienia.pdf
      03_kod/
        Naucz_Pilota_kod.zip
        instrukcja_kompilacji.pdf
        THIRD_PARTY_NOTICES.txt
      04_instrukcja/
        instrukcja_uzytkownika.pdf
      05_prezentacja/
        Naucz_Pilota_demo.mp4
        opis_funkcjonalnosci.pdf
      06_weryfikacja/
        raport_weryfikacji.pdf

Nazwy folderów i format dodatkowego raportu są naszą propozycją. Nie dodawaj do zgłoszenia kluczy API, niepotrzebnych rozmów uczniów ani lokalnego zapisu autora.

## Co ma zrobić Codex
- Zbudować źródła i wydanie albo wskazać dokładnie niewykonany krok środowiska.
- Wygenerować instrukcje zgodne z działającą wersją.
- Uzupełnić raport o prawdziwe wyniki, a niewykonane testy oznaczyć.
- Przygotować szablon jednostronicowego opisu i scenariusz nagrania.
- Sprawdzić, że sekrety i rozwiązania human_check nie trafiły do produkcyjnego bundla.
- Utworzyć lokalną paczkę z plikami; nie wysyłać jej samoczynnie.

## Co pozostaje po stronie autora
- Sprawdzić uprawnienie do udziału, skład zespołu i aktualne zasady.
- Uzupełnić oraz podpisać formularze, w razie potrzeby uzyskać zgodę opiekuna.
- Zapewnić klucz, model i działający backend dla odbiorców; skontrolować limity kosztów.
- Przetestować dostarczone .exe na innym komputerze z Windows.
- Nagrać rzeczywiste działanie finalnej wersji, dołączyć własny głos lub napisy.
- Wybrać miejsce udostępnienia, sprawdzić pobieranie bez konta autora i wysłać zgłoszenie.

Codex nie zastępuje testu na urządzeniu, którego nie ma, ani podpisu autora. Te kroki mają być jawnie widoczne w planie, nie odkryte w dniu terminu.

## Plan filmu
Użyj scenariusza 4:30 z docs/06-ui-ux.md. Główna scena: M04, ponieważ błąd znaku w (x-p)² jest czytelny wizualnie. Kolejność: problem, przejazd, wyjaśnienie gracza, odpowiedź prawdziwego modelu, nowa propozycja robota, osobna próba gracza, krótkie podsumowanie.

W filmie pokaż wynik działania, nie samą stronę startową i kod. Odpowiedzi mogą wymagać cięć montażowych, lecz nie podmieniaj błędnej propozycji robota rozwiązaniem referencyjnym udającym odpowiedź modelu.

## Jednostronicowy opis — treść do dopracowania po implementacji
**Naucz Pilota — gra o funkcjach, w której uczysz robota.**

Naucz Pilota pomaga ćwiczyć wpływ parametrów na wykres funkcji. W sześciu misjach użytkownik zapisuje wzór wyznaczający trasę robota Piko, przechodzi przez bramki i unika przeszkód. Misje obejmują wysokość i nachylenie prostej, przesunięcia i szerokość paraboli oraz łączenie przekształceń.

Piko odgrywa początkującego ucznia. Gracz poprawia jego błędny pomysł, wyjaśnia zasadę i przewiduje wartości funkcji. Model językowy reaguje na wyjaśnienie, a na innej planszy proponuje własny wzór na podstawie zapisanych zasad. Wszystkie propozycje ocenia deterministyczny silnik matematyczny.

Każdą misję kończy osobne zadanie gracza bez pomocy AI. Aplikacja rozróżnia pierwszy samodzielny wynik, późniejsze próby i wynik robota. Pamięć Piko jest stanem aplikacji oraz kontekstem rozmowy; projekt nie trenuje wag modelu.

[Po implementacji uzupełnij: faktycznie użyty model, wymagania uruchomienia, wykonane testy, autorzy. Usuń każde twierdzenie o funkcji, która nie została ukończona.]

Nie publikuj tego szablonu z nawiasami. Sprawdź faktyczną objętość po wyrenderowaniu dokumentu do PDF.

## Ostateczna kontrola wydania
- Termin i dokumenty sprawdzone w najnowszym regulaminie.
- Formularze kompletne, podpisy czytelne.
- Źródła odtwarzalne z instrukcji i lockfile.
- .exe startuje bez Node i bez katalogu developerskiego autora.
- Model live działa z komputera odbiorcy; tryb demo opisany.
- Film rzeczywiście trwa nie więcej niż 5 minut i otwiera się w zwykłym odtwarzaczu.
- Opis zajmuje nie więcej niż jedną stronę.
- Link otwiera się w sesji bez logowania autora.
- Nie ma .env, kluczy, sekretów, cudzych materiałów bez odpowiedniej licencji.
- Każdy element raportu odpowiada końcowej wersji kodu.
