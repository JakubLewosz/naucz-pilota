# Naucz Pilota

Działająca lokalnie gra edukacyjna po polsku: sześć misji, 24 plansze, funkcje stopnia 0–2, robot Piko i osobna samodzielna próba gracza. Matematyka jest liczona analitycznie przez współdzielony silnik TypeScript. Demo działa bez klucza, serwera i internetu po załadowaniu zasobów aplikacji.

**Stan:** pełna kampania demo i testy lokalne działają. Adapter prawdziwego AI jest zaimplementowany i sprawdzony z atrapami HTTP; testy płatnego modelu są NOT RUN. ZIP Windows jest cross-buildem z macOS; uruchomienie na Windows jest NOT RUN. Szczegóły i rzeczywiste wyniki: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## Szybki start

Wymagany Node 24.x (sprawdzono 24.11.0) i npm. Python nie jest wymagany do uruchomienia gry.

```sh
npm ci
npm run dev
```

Otwórz http://127.0.0.1:5173. Backend działa na porcie 3001; Vite przekazuje `/api`. Domyślnie wybrane jest jawne demo. Wyłączenie backendu nie blokuje rozgrywki demo.

```sh
npm run typecheck
npm run lint
npm test
npm run test:content
npx playwright install chromium ffmpeg
npm run test:e2e
npm run build
npm start
```

Po buildzie `npm start` serwuje aplikację i API pod http://127.0.0.1:3001. Do lokalnych testów live w tym wariancie ustaw PUBLIC_ORIGIN=http://127.0.0.1:3001. Domyślny origin w `.env.example` dotyczy Vite.

## Prawdziwe AI

Skopiuj `.env.example` do `.env`. Ustaw na backendzie `AI_MODE=live`, `OPENAI_API_KEY` i dostępny `AI_MODEL` obsługujący Structured Outputs. Nie wpisuj klucza w czacie, frontendzie ani `VITE_*`. Restartuj backend, a w ustawieniach gry wybierz live.

Osobny, świadomie uruchamiany test płatny:

```sh
npm run test:ai:live
```

Bez klucza/modelu zapisuje `NOT RUN` w `checks/ai-live-results.json` i kończy się kodem 2. Z kluczem wykonuje 10 scenariuszy semantycznych oraz po teach/transfer dla sześciu umiejętności (22 tury, maks. 44 wywołania). Przed nim zatrzymaj lokalny backend: SQLite jest magazynem jednej instancji. Obowiązuje trwały limit z `.env`. Wyniki struktury i silnika zapisują się automatycznie; jakość dialogu wymaga przeczytania odpowiedzi przez człowieka. Testy zwykłe nigdy nie wywołują płatnego API.

## Desktop i wydanie

```sh
npm run desktop:dev
npm run desktop:dist
npm run release:check
npm run release:prepare
```

`desktop:dev` otwiera lokalnego Electrona. `desktop:dist` buduje ZIP Windows x64 w `release/bin`. Po rozpakowaniu uruchamia się `Naucz Pilota.exe`, bez Node. Dostarczona paczka jest niepodpisana; test na czystym Windows pozostaje do wykonania. Nie uruchamiaj samego EXE poza całym rozpakowanym katalogiem.

Aby przygotować live dla odbiorcy, skonfiguruj zaufany origin HTTPS w `apps/desktop/distribution.json` i ponownie zbuduj paczkę. Klucz pozostaje wyłącznie na backendzie. Obecnie adres jest pusty, dlatego paczka ma działające demo, ale nie ma gotowości live dla jury. Szczegóły wdrożenia: [docs/11-uruchomienie.md](docs/11-uruchomienie.md).

## Rozgrywka i zapis

Każda misja: practice → teach → robot_transfer → human_check. W teach popraw wzór, przewidź G1/G2, napisz wyjaśnienie i potwierdź kanoniczną kartę zasady. Opinia AI nie steruje zaliczeniem. W samodzielnym zadaniu przed pierwszym lotem nie ma trajektorii, obliczeń, dziennika ani AI. Pierwszy parsowalny wynik jest zachowany również po poprawkach i odświeżeniu. Powtórzenie ukończonej misji zachowuje poprzednie podejście.

Postęp jest wersjonowany w localStorage. Nieznany/uszkodzony zapis nie jest automatycznie nadpisywany. Ustawienia pozwalają ograniczyć ruch, pokazać obrys Piko, powiększyć tekst i usunąć postęp po potwierdzeniu. Instrukcja: [docs/12-instrukcja-uzytkownika.md](docs/12-instrukcja-uzytkownika.md).

## Dane, testy i dokumenty

`content/` zawiera oryginalne dane autora. `build:content` waliduje schemat i generuje dane publiczne bez witness/knownFailures oraz typy i statyczne walidatory DTO. Produkcyjny renderer nie kompiluje kodu z tekstu. Referencyjny Python pozostaje narzędziem autora:

```sh
python3 tools/validate_missions.py
python3 tools/audit_package.py
```

Raporty w `checks/`. Weryfikacja ograniczeń: [docs/13-raport-weryfikacji.md](docs/13-raport-weryfikacji.md). Materiały konkursowe i jawne braki: `release/Naucz_Pilota_zgloszenie/`. Nie opublikowano hostingu ani nie wysłano zgłoszenia. Oryginalny README paczki zachowano w `docs/README-pakiet-startowy.md`.
