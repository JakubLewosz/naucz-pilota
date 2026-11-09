# Naucz Pilota

Działająca lokalnie gra edukacyjna po polsku: sześć misji, 24 plansze, funkcje stopnia 0–2, robot Piko i osobna samodzielna próba gracza. Matematyka jest liczona analitycznie przez współdzielony silnik TypeScript. Demo działa bez klucza, serwera i internetu po załadowaniu zasobów aplikacji.

**Stan po audycie z 9 listopada 2026.** Gra odzyskuje przejście po błędach AI, zachowuje notatkę z lekcji i przekazuje ją Piko przed lotem. Historyczny odbiór live dotyczy promptu 1.0.2. Bieżący prompt 1.1.0 sprawdzono z atrapą. Wyniki i zakres odbioru są w [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

**Windows x64.** Pobierz ZIP, rozpakuj cały folder i uruchom `Naucz Pilota.exe`. Paczka zawiera tryb demo i pochodzi z przebiegu Actions, który sprawdził spakowaną aplikację na Windows. Kod źródłowy, instrukcje, raport i nagrania znajdziesz w tym samym wydaniu. [GitHub Releases 1.0.0](https://github.com/JakubLewosz/naucz-pilota/releases/tag/v1.0.0)

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

`desktop:dev` otwiera lokalnego Electrona. `desktop:dist` buduje ZIP Windows x64 w `release/bin`. Po rozpakowaniu uruchamia się `Naucz Pilota.exe`, bez Node. Paczka jest niepodpisana. Automatyczny test spakowanego EXE przeszedł na runnerze Windows. Odbiór na osobnym komputerze użytkownika ma status NOT RUN. Nie uruchamiaj samego EXE poza całym rozpakowanym katalogiem.

Aby przygotować live dla odbiorcy, skonfiguruj zaufany origin HTTPS w `apps/desktop/distribution.json` i ponownie zbuduj paczkę. Klucz pozostaje wyłącznie na backendzie. Obecnie adres jest pusty, dlatego paczka ma działające demo, ale nie ma gotowości live dla jury. Szczegóły wdrożenia: [docs/11-uruchomienie.md](docs/11-uruchomienie.md).

## Rozgrywka i zapis

Każda misja: practice → teach → robot_transfer → human_check. W teach popraw wzór, przewidź G1/G2, napisz wyjaśnienie, przeczytaj parafrazę Piko i potwierdź treść notatki z lekcji. Możesz zapisać lekcję bez odpowiedzi Piko. Transfer używa notatki wraz ze sprawdzoną zasadą. Opinia AI nie steruje zaliczeniem. W samodzielnym zadaniu przed pierwszym lotem nie ma trajektorii, obliczeń, dziennika ani AI. Pierwszy parsowalny wynik jest zachowany również po poprawkach i odświeżeniu. Powtórzenie ukończonej misji zachowuje poprzednie podejście.

Postęp jest wersjonowany w localStorage. Zapis wersji 1 migruje do wersji 2 z zachowaniem pierwszej próby i archiwum. Uszkodzony zapis wymaga zachowania kopii przed rozpoczęciem nowego. W live opcja „Wyczyść rozmowę” czyści także kontekst tej sceny w aktywnej sesji SQLite. Ustawienia pozwalają ograniczyć ruch, pokazać obrys Piko, powiększyć tekst i usunąć postęp po potwierdzeniu. Instrukcja: [docs/12-instrukcja-uzytkownika.md](docs/12-instrukcja-uzytkownika.md).

## Dane, testy i dokumenty

`content/` zawiera oryginalne dane autora. `build:content` waliduje schemat i generuje dane publiczne bez witness/knownFailures oraz typy i statyczne walidatory DTO. Produkcyjny renderer nie kompiluje kodu z tekstu. Referencyjny Python pozostaje narzędziem autora:

```sh
python3 tools/validate_missions.py
python3 tools/audit_package.py
```

Raporty w `checks/`. Weryfikacja ograniczeń: [docs/13-raport-weryfikacji.md](docs/13-raport-weryfikacji.md). Materiały konkursowe i jawne braki: `release/Naucz_Pilota_zgloszenie/`. Nie opublikowano hostingu ani nie wysłano zgłoszenia. Oryginalny README paczki zachowano w `docs/README-pakiet-startowy.md`.

## Odbiór wydania i test live w małym zakresie

Obecna wersja ma również:

```sh
npm run test:ai:live -- --case M01 --max-calls 4
npm run desktop:smoke
npm run desktop:smoke -- --executable "release/bin/win-unpacked/Naucz Pilota.exe"
npm run docker:build
npm run docker:smoke
```

Pierwsza komenda jest płatnym testem teach → transfer M01. Używa jednej sesji i zatrzymuje się po pierwszym błędzie, zachowując statusy pozostałych przypadków jako NOT RUN. Budżet tej próby wynosi maksymalnie 4 żądania dostawcy; nadal obowiązuje trwały limit dzienny. Pełny zestaw ma 22 tury i domyślny budżet 44 żądań. Wynik automatyczny dotyczy struktury i matematyki; semantyka wymaga przeczytania odpowiedzi.

Kontener został lokalnie zbudowany i uruchomiony; testowane są health, brak .env/rozwiązań autora w obrazie, użytkownik bez uprawnień root i trwałość sesji po restarcie. Publiczny hosting HTTPS nadal nie jest skonfigurowany. Test kontenera nie uruchamia płatnego API.

Instrukcje dalszego odbioru: docs/15-pilotaz.md i docs/16-windows-odbior.md. Ręczny workflow GitHub Actions dla Windows i Linux jest przygotowany w .github/workflows/verify.yml; można go uruchomić w zakładce Actions repozytorium. Przebieg dla poprawek przeszedł na Windows i Linuksie, w tym start i wznowienie spakowanego EXE oraz reset rozmowy Electrona z atrapą. [Wynik GitHub Actions](https://github.com/JakubLewosz/naucz-pilota/actions/runs/42685071630).


## Historyczny odbiór live promptu 1.0.2

3 listopada 2026: prompt 1.0.2, model gpt-5.4-mini-2026-03-17. Pełne 22 tury przeszły kontrolę schematu, pamięci i zgodności z niezależnym silnikiem, po jednym żądaniu dostawcy na turę. W sześciu transferach robot uzyskał 2 poprawne tory i 4 odrzucone przez silnik; błędne propozycje zachowano bez podstawiania rozwiązań. M04 przeszła też rzeczywisty test UI live z zachowaniem błędnej pierwszej próby po poprawce i odświeżeniu. Nagranie live ma 45,28 s.

Wyniki: checks/ai-live-results.json, checks/ai-semantic-review.json i checks/browser-live.json. Przegląd wykonany przez asystenta jest wstępny; SEM03 i SEM09 mają etykiety oceny różniące się od rubryki, a Piko czasem mówi zbyt nauczycielsko. Akceptacja jakości dialogu przez człowieka i pilotaż pozostają do wykonania. Lokalna konfiguracja klucza działa; klucz nie jest częścią repozytorium ani wydania.

Repozytorium zawiera kod, lockfile, dane autora, testy, raporty, PDF-y oraz nagrania [demo](release/media/Naucz_Pilota_demo.mp4) i [live](release/media/Naucz_Pilota_live.mp4). Komenda `npm run desktop:dist` pozwala odtworzyć paczkę Windows. Gotowy ZIP jest dostępny w [wydaniu 1.0.0](https://github.com/JakubLewosz/naucz-pilota/releases/tag/v1.0.0).
