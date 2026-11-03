# Stan implementacji — Naucz Pilota
Aktualizacja: 2026-11-03. Środowisko: macOS arm64, Node 24.11.0, npm 11.6.1.

Wykonano wszystkie części E0–E6 dostępne lokalnie. Projekt nie ma jeszcze pełnego odbioru live, Windows i konkursowego: konkretne braki są poniżej. Repozytorium było puste; wskazany ZIP rozpakowano do katalogu głównego, zachowując specyfikacje, dane i walidator autora. Nie publikowano ani nie wysyłano zgłoszenia.

## Etapy
| Etap | Stan i dowód |
|---|---|
| E0 | WYKONANY. npm workspaces, strict TypeScript, React/Vite, Express, wspólne core/content/contracts, lockfile. `npm ci` odtworzone od zera. `npm run dev` i produkcyjny `npm start` działają. |
| E1 | WYKONANY. Parser bigint z dokładną redukcją i limitami; analityczne bramki, obrys, przeszkody i granice; pierwsze zdarzenie niezależne od priorytetu wyniku. SVG z równą skalą osi i animacją. 24 witness i 37 knownFailures przechodzą oczekiwane asercje. |
| E2 | WYKONANY. Cała M01: practice → teach → robot_transfer → human_check → podsumowanie. Dwie prognozy, własne wyjaśnienie, potwierdzana zasada, jawne demo offline, wersjonowany zapis i niezmienna pierwsza parsowalna próba. E2E oraz smoke Electron. |
| E3 | IMPLEMENTACJA I MOCK WYKONANE. Responses API/Structured Outputs, sesje cookie/token, przeliczanie faktów, kanoniczna pamięć, izolacja scen, trwały limit SQLite, idempotencja, CAS, jeden retry formatu, wspólny deadline, refusal/incomplete/awarie. 32 przypadki INT i test oficjalnego SDK na HTTP stub. ODBIÓR LIVE: NOT RUN — brak klucza/modelu. |
| E4 | KAMPANIA DEMO WYKONANA. 6 misji i 24 oryginalne sceny, 18 wskazówek, wspólne komponenty, odblokowania, archiwum powtórek, reset i wznowienie. Pełny E2E przechodzi także po porażce Piko w M04. Live sześciu umiejętności: NOT RUN. |
| E5 | CZĘŚĆ TECHNICZNA WYKONANA. 1366×768, 1440×900, 390×844; axe WCAG A/AA na home/practice bez naruszeń, oględziny zrzutów, klawiaturowa M01, reduced motion, 200% tekst, offline demo. PILOTAŻ 3–5 OSÓB: NOT RUN — wymaga uczestników. |
| E6 | LOKALNE WYDANIE I MATERIAŁY WYKONANE. ZIP Windows x64, inspekcja PE/ASAR, smoke Electron macOS, pięć zweryfikowanych PDF-ów, źródła z lockfile i notices, checklisty i rzeczywisty film demo M04 (37,56 s, MP4). Windows runtime, HTTPS jury, film live i podpisy: osobne blokery. |

## Rzeczywiste wyniki poleceń
| Polecenie / kontrola | Wynik |
|---|---|
| `npm ci` | PASS; 612 pakietów z lockfile, 619 audytowanych. Ostrzeżenia narzędzi developerskich opisane poniżej. |
| `npm run dev` | PASS; Vite na 127.0.0.1:5173 i API na 3001, jawne demo. |
| `npm run build:content` | PASS; JSON Schema, 6/24 sceny, publiczne dane bez witness/knownFailures, wygenerowane typy i statyczne walidatory. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test -- --reporter=default --reporter=json --outputFile=checks/unit-results.json` | PASS, 152 testy w 5 plikach; raport rzeczywisty w checks/unit-results.json. |
| `npm run test:content` | PASS, 62 testy: schemat i wszystkie 24+37 fixture. |
| `python3 tools/validate_missions.py --json-report checks/math-validation-current.json` | PASS, 6 misji / 24 sceny / 24 witness / 37 knownFailures / 42 kontrole. |
| `python3 tools/audit_package.py` | PASS; niezależne rozwinięcie AST i nierówności na przedziałach, 24+37, 18 wskazówek; checks/independent-audit.json. |
| `npx tsx tools/report-evals.ts` | PASS; 32 deterministyczne INT PASSED; 10 semantycznych SEM NOT RUN. Dane wejściowe SEM walidowane, bez przypisania im sukcesu jakościowego. |
| `npm run test:e2e` | PASS, 7 testów: kompletna kampania, pierwsza próba/reload/archiwum, 3 rozdzielczości/axe, awaria live, klawiatura/offline/200%. Raport checks/e2e-results.json. |
| `npm run test:ai:live` | NOT RUN, kod 2. Brak OPENAI_API_KEY i/lub AI_MODEL; 0 żądań dostawcy. checks/ai-live-results.json. |
| `npm run build` | PASS; frontend i samodzielny JavaScript serwera, bez zależności runtime od kodu TypeScript workspace. |
| `SERVER_PORT=3002 PUBLIC_ORIGIN=http://127.0.0.1:3002 npm start` | PASS; z produkcyjnego builda M01-practice daje sukces, API health HTTP 200, brak błędów strony. |
| `npm run desktop:dist` | PASS; release/bin/Naucz_Pilota_1.0.0_Windows_x64.zip, 153313090 bajtów. Niepodpisana paczka z EXE PE. |
| `npx tsx tools/smoke-desktop.ts` | PASS na macOS; lokalny app://, cała M01 offline, sandbox/contextIsolation, brak require/process w rendererze. |
| `npm run release:prepare` | PASS; folder 01–06, źródłowy ZIP tworzony przenośnie w Node 24, pięć PDF-ów, film i jawne braki formularzy. |
| Kontrola obu ZIP-ów i folderu | PASS; CRC obu archiwów, zgodność SHA-256 Windows, 12 wymaganych plików, 121 plików źródłowych, brak .env/node_modules/var. checks/package-audit.json. |
| `npm run release:check` | PASS LOCAL CHECKS; dane publiczne, renderer bez sekretów/author corpus/source maps/runtime eval, ASAR bez node_modules, PE. Live endpoint NOT READY; Windows runtime NOT RUN. SHA-256 w checks/release-check.json. |
| `npm audit --omit=dev --json` | PASS; 0 podatności produkcyjnych. |
| `npm audit` / `npm audit fix` | 25 moderate w zależnościach developerskich minimatch i narzędzi zależnych. Nie wymuszono niekompatybilnego downgrade ESLint. Desktop nie zawiera tych zależności. |
| `npx tsx tools/record-demo.ts` + konwersja ffmpeg | PASS; rzeczywiste UI M04 z napisami, jawne demo, MP4 1440×900, 37,56 s. Bez fikcyjnego modelu i głosu autora. |
| `tools/build-pdfs.py` | PASS w bundlowanym Pythonie autora; 5 PDF-ów, wyrenderowano i obejrzano wszystkie 8 stron. Opis funkcjonalności: dokładnie 1 strona. Gra nie wymaga Pythona. |
| `docker info` | BLOCKED; brak działającego demona i lokalnego socketu. Dockerfile przygotowany, obraz NOT BUILT/NOT RUN. |

## Dostarczone pliki
- `README.md`: działające komendy; oryginał paczki zachowany w docs/README-pakiet-startowy.md.
- `docs/11-uruchomienie.md`, `docs/12-instrukcja-uzytkownika.md`, `docs/13-raport-weryfikacji.md`, `docs/14-opis-funkcjonalnosci.md`.
- `output/pdf/`: instrukcje uruchomienia, kompilacji, użytkownika, jednostronicowy opis i raport.
- `release/Naucz_Pilota_zgloszenie/`: folder 01–06 z aplikacją, źródłami ZIP, PDF-ami, notices, filmem, raportami i jawnymi brakami formularzy.
- `release/CHECKLISTA.md`: rzeczywisty stan materiałów i kroki odbioru autora.
- `Dockerfile`, `.dockerignore`, `.env.example`, `apps/desktop/distribution.json`: przygotowana konfiguracja bez sekretów; adres jury pusty.
- `checks/toolchain.json`: dokładne wersje narzędzi i zależności.

## Problemy ujawnione i naprawione
Brak eksportu bad-parser.json; runtime Ajv naruszający CSP; błędny eksport ESM walidatorów; pozycja robota w podglądzie; pomijanie animacji; odblokowania przy powtarzaniu; nadmiarowe node_modules w pierwszym ASAR; kontrola pól publicznych nieuwzględniająca opcjonalnego vertexLock; bundlowanie współdzielonych pakietów do serwera; typy smoke Electrona. Wyniki PASS dotyczą powtórzeń po poprawkach. Specyfikacje i źródłowe dane misji nie zostały rozluźnione pod testy.

## Zewnętrzne warunki pełnego odbioru
1. Ustaw OPENAI_API_KEY i AI_MODEL w lokalnym .env backendu, wykonaj jawny test live i przeczytaj odpowiedzi według rubryk. Nie wklejaj sekretu do rozmowy. 10 SEM i 6 sekwencji teach/transfer ma gotowy runner.
2. Wdróż jedną instancję backendu na zaufanym HTTPS z trwałym wolumenem SQLite, ustaw distribution.json i przebuduj ZIP. Sprawdź połączenie z komputera odbiorcy. Nie publikowano w tym zadaniu.
3. Rozpakuj i odbierz paczkę na czystym Windows bez Node: offline, zapis/wznowienie, live i odłączenie sieci. Cross-build oraz smoke macOS nie zastępują tego testu.
4. Przeprowadź pilotaż 3–5 osób. Nie ma jeszcze wyników użyteczności od ludzi ani podstaw do twierdzeń o skuteczności edukacyjnej.
5. Sprawdź aktualny regulamin, kwalifikację i formularze; uzupełnij własne dane i podpisy. Bieżący film jest wyłącznie demo; pokaz prawdziwego AI wymaga nowego nagrania po konfiguracji. Publikacja, link chmurowy i wysłanie zgłoszenia pozostają po stronie autora.

## Następny krok
Lokalna implementacja zakończona. Kontynuacja powinna zaczynać się od faktycznej konfiguracji live i odbiorów zewnętrznych powyżej, z zachowaniem istniejącego kodu i raportów. Nie oznaczać live, Windows, pilotażu ani zgłoszenia jako PASS na podstawie obecnej demonstracji.
