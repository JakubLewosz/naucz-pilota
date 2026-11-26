# Raport z testów

Piko: Misja Funkcja 1.0.0, stan na 22 listopada 2026. Środowisko: macOS arm64, Node 24.11.0, npm 11.6.1.

## Testy automatyczne

- Kontrola typów (TypeScript) i lint (ESLint): bez błędów.
- 223 testy jednostkowe: parser wzorów, geometria i kolizje, zasady zaliczania, kontrakt AI, serwer (sesje, limity, kod dostępu), zapis i migracja postępu oraz oba adaptery AI (Claude i OpenAI) na atrapie HTTP, ukrycie kanonicznej zasady w locie, kontrakt przekonania Piko i pętlę poprawy lekcji, w tym odmowa, ucięta odpowiedź i błędy 400/404/429.
- 62 testy treści: 24 plansze mają sprawdzony poprawny tor, a 37 kontrolnych błędnych wzorów jest poprawnie odrzucanych. Niezależny walidator w Pythonie potwierdza to samo.
- 17 testów całej gry w przeglądarce (Playwright): pełna kampania, ochrona pierwszej próby, opóźniona odpowiedź AI, pominięcie lotu Piko, czyszczenie rozmowy, awarie AI i powrót do trybu pokazowego, kod dostępu, animacja lotu. Zawierają automatyczne kontrole dostępności (axe, poziom A/AA) przy 1366×768, 1440×900 i 390×844.

## Test na prawdziwym modelu

Claude Sonnet 5.5, prompt 2.0.0. Piko w locie zna tylko lekcje gracza. Szczegóły: checks/ai-live-claude-sonnet-5-5.md.

- 22/22 tur zgodnych ze schematem i fazą gry, w tym błędne i niejasne wyjaśnienia oraz próby wstrzyknięcia poleceń.
- Przekonania Piko wiernie oddają słowa gracza, także błędne.
- Lot zależy od lekcji: w misji 4 dobra lekcja dała udany lot, a lekcja błędna i pusta skończyły się rozbiciem. W interfejsie przeszła pełna pętla: błędna lekcja, rozbicie, poprawa lekcji, udany lot.
- Mediana czasu odpowiedzi ok. 4 s.

## Aplikacja okienkowa

- Windows x64: paczka zbudowana na macOS (electron-builder). Kontrola `release:check` przeszła: plik EXE, zgodność archiwum aplikacji z buildem, brak sekretów i rozwiązań autora w paczce.
- macOS: spakowana aplikacja Electron przeszła misję 1 offline i zachowała postęp po ponownym uruchomieniu.
- Uruchomienie EXE na Windows: wcześniejszy przebieg GitHub Actions (Windows Server) potwierdził start, misję 1 i zachowanie postępu dla starszej wersji. Dla aktualnej wersji ten sam workflow jest gotowy do uruchomienia.

## Serwer

Obraz Docker i stos z Caddy (HTTPS) przeszły lokalny test: zaufany certyfikat, ograniczenie dostępu do adresów IP albo kodu, limit 16 KiB na żądanie, zerowy budżet AI i zachowanie sesji po restarcie.

## Ograniczenia

Gra nie była jeszcze testowana z grupą uczniów. Wyniki opisują wykonanie zadań w grze, a nie trwały przyrost wiedzy. Jakość rozmów oceniono na podstawie przeglądu transkryptów przez autora i automatycznych kontroli. Formalnej oceny według rubryki dokonuje człowiek.
