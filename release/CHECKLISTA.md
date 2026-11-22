# Zgłoszenie: lista kontrolna

Konkurs „Sztuczna inteligencja wśród nas”, termin **29 listopada 2026**. Link do chmury z kompletem plików wysyła się na **informatyka_konkurs@uwb.edu.pl** ([strona konkursu](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas)).

Folder do wysłania tworzy `npm run release:prepare` w `release/Piko_Misja_Funkcja_zgloszenie/`.

## Wymagania regulaminu (§3 ust. 7)

| Wymóg | Plik w folderze | Stan |
|---|---|---|
| Karta Zgłoszenia, wypełniona, skan (Załącznik 1) | `01_formularze/` | **do zrobienia przez autora** |
| Klauzula Informacyjna, wypełniona, skan (Załącznik 2) | `01_formularze/` | **do zrobienia przez autora** |
| Wersja binarna + instrukcja uruchomienia | `02_aplikacja/Piko_Misja_Funkcja_Windows.zip` (z wbudowanym Claude), `instrukcja_uruchomienia.pdf` | gotowe |
| Kod źródłowy + instrukcja kompilacji | `03_kod/Piko_Misja_Funkcja_kod.zip`, `instrukcja_kompilacji.pdf` | gotowe |
| Instrukcja korzystania z aplikacji | `04_instrukcja/instrukcja_uzytkownika.pdf` | gotowe |
| Film do 5 min, AVI lub MP4 | `05_prezentacja/Piko_Misja_Funkcja_film.mp4` (3:41, 1080p) | gotowe |
| Opis funkcjonalności, maks. 1 strona | `05_prezentacja/opis_funkcjonalnosci.pdf` | gotowe |
| (dodatkowo) Raport z testów | `06_weryfikacja/` | gotowe |

## Kroki dla autora

0. **Klucz do aplikacji z wbudowanym AI.** Na platform.claude.com utwórz osobny workspace (np. „Piko konkurs”), ustaw w nim miesięczny limit wydatków (np. 10 USD) i utwórz w nim nowy klucz. Wpisz go w `.env` jako `ANTHROPIC_API_KEY` i zbuduj paczkę: `npm run desktop:dist:ai`, potem `npm run release:prepare`. Klucz da się wydobyć z pliku aplikacji, a organizator może publikować zgłoszenia, dlatego limit jest konieczny. Po ogłoszeniu wyników (do 20 grudnia 2026) unieważnij ten klucz.
1. Pobierz ze strony konkursu załączniki (Karta Zgłoszenia, Klauzula Informacyjna), wypełnij je i podpisz. Osoba niepełnoletnia potrzebuje podpisu rodzica lub opiekuna. Zeskanuj albo zrób wyraźne zdjęcia i wrzuć je do `01_formularze/`.
2. Sprawdź warunki udziału: uczeń szkoły ponadpodstawowej, poniżej 21 lat przez cały konkurs, drużyna maksymalnie dwuosobowa.
3. (Zalecane) Sprawdź aktualny EXE na Windows. Najprościej: na GitHubie wejdź w Actions, wybierz „Verify release on Windows and Linux”, kliknij Run workflow i wybierz gałąź `codex/jury-readiness`. Możesz też rozpakować ZIP na dowolnym komputerze z Windows i zagrać w misję 1.
4. Obejrzyj film w całości (dźwięk i napisy).
5. Wrzuć cały folder `Piko_Misja_Funkcja_zgloszenie` na Google Drive albo OneDrive. Ustaw dostęp „każdy, kto ma link, może wyświetlać”. Otwórz link w oknie prywatnym i sprawdź, czy da się pobrać pliki.
6. Wyślij link na informatyka_konkurs@uwb.edu.pl przed 29 listopada 2026. W treści podaj tytuł projektu „Piko: Misja Funkcja” oraz imiona i nazwiska członków drużyny.
7. Po konkursie unieważnij klucz wbudowany w aplikację i klucz używany w trakcie prac (platform.claude.com, API Keys).
