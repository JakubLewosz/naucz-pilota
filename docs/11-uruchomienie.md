# Instrukcja kompilacji i uruchomienia

Piko: Misja Funkcja 1.0.0. Sprawdzono na macOS arm64 z Node 24.11.0 i npm 11.6.1. Plik package-lock.json przypina dokładne wersje bibliotek. Python nie jest potrzebny do gry.

## Uruchomienie z kodu źródłowego

1. Zainstaluj Node.js 24 (z npm).
2. Rozpakuj kod źródłowy i w folderze z plikiem package.json wykonaj `npm ci`.
3. Wykonaj `npm run dev` i otwórz http://127.0.0.1:5173.
4. Zatrzymasz serwer skrótem Ctrl+C.

Bez klucza API gra działa w trybie pokazowym, z przygotowanymi odpowiedziami Piko.

## Włączenie prawdziwego AI

1. Załóż konto na platform.claude.com, doładuj je i utwórz klucz API (API Keys, Create Key).
2. Skopiuj plik `.env.example` do `.env`.
3. W `.env` ustaw `AI_MODE=live`, `AI_PROVIDER=anthropic` i `ANTHROPIC_API_KEY=` z Twoim kluczem. Domyślny model to `claude-sonnet-5-5` z `AI_REASONING_EFFORT=medium`.
4. Uruchom ponownie `npm run dev`. Nowy gracz dostaje prawdziwe AI automatycznie, a w Ustawieniach możesz przełączać tryby.

Klucz jest tylko na serwerze i nigdy nie trafia do przeglądarki ani do aplikacji okienkowej. Plik `.env` jest wykluczony z repozytorium. Zamiast Claude można użyć OpenAI: `AI_PROVIDER=openai`, `OPENAI_API_KEY`, `AI_MODEL=gpt-6-luna`.

Jedna tura rozmowy kosztuje ok. 1–2 centów. Serwer ma limity: 6 tur na minutę na sesję i `AI_DAILY_REQUEST_BUDGET` (domyślnie 200) żądań dziennie.

## Kompilacja wersji produkcyjnej

`npm run build` sprawdza typy, generuje dane misji i buduje interfejs oraz serwer do folderu `dist/`. `npm start` uruchamia aplikację i API razem na http://127.0.0.1:3001. W tym wariancie ustaw w `.env` `PUBLIC_ORIGIN=http://127.0.0.1:3001`.

## Aplikacja Windows

`npm run desktop:dist` buduje aplikację Electron i tworzy `release/bin/Piko_Misja_Funkcja_1.0.0_Windows_x64.zip`. `npm run release:check` sprawdza zawartość paczki: plik EXE, archiwum aplikacji, brak sekretów i brak rozwiązań autora. Paczka nie ma podpisu cyfrowego, więc Windows może pokazać ostrzeżenie o nieznanym wydawcy.

Domyślna paczka działa w trybie pokazowym, bez internetu. Żeby połączyć ją z serwerem z prawdziwym AI, przed budową ustaw `PIKO_DESKTOP_HTTPS_ORIGIN` na adres HTTPS tego serwera. Aplikacja zna wtedy tylko adres serwera, nigdy klucz.

## Serwer w internecie (opcjonalnie)

Dockerfile buduje obraz na Node 24. `deploy/jury/compose.yaml` dodaje Caddy (HTTPS), ograniczenie dostępu do wybranych adresów IP i trwały wolumen na bazę SQLite. `deploy/jury/compose-code.yaml` wpuszcza każdego, kto poda kod dostępu (`JURY_ACCESS_CODE`, 32–256 znaków). Klucz API przekaż jako zmienną środowiskową serwera, nie kopiuj `.env` do obrazu. Szczegóły i lista kontrolna: [17-odbior-live.md](17-odbior-live.md). Lokalny test całego stosu bez kosztów: `npm run jury:https:smoke` i `npm run docker:smoke`.

## Testy

- `npm run typecheck`, `npm run lint`: kontrola typów i stylu.
- `npm test`: 216 testów jednostkowych (silnik, kontrakt AI, serwer, zapis gry, oba adaptery AI na atrapie HTTP).
- `npm run test:content`, `python3 tools/validate_missions.py`: poprawność 24 plansz.
- `npx playwright install chromium`, potem `npm run test:e2e`: 17 testów całej gry w przeglądarce.
- `npm run test:ai:live -- --dry-run`: przygotowanie zestawu live bez wywołań API.
- `npm run test:ai:live -- --allow-paid --max-calls 44`: 22 tury na prawdziwym modelu, raport w `var/ai-live/` i `checks/ai-live-results.json`.

Skrypty `tests/live/m04-browser.ts` i `tests/live/run-m04-generalization.ts` dokumentują wcześniejsze testy na OpenAI i wymagają `OPENAI_API_KEY`.

## Dane i prywatność

Postęp gry jest w pamięci przeglądarki (localStorage) lub w profilu aplikacji Electron. Serwer trzyma bieżącą rozmowę w SQLite przez 24 godziny. „Wyczyść rozmowę” usuwa ją od razu. Do dostawcy AI trafia opis planszy, sprawdzone fakty liczbowe, wyjaśnienie gracza i notatka z lekcji.
