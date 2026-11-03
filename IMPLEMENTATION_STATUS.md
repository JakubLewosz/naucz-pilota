# Stan implementacji — Naucz Pilota
Aktualizacja: 2026-11-03. Środowisko: macOS arm64, Node 24.11.0, npm 11.6.1.

Wykonano wszystkie części E0–E6 dostępne lokalnie, w tym rzeczywiste wywołania AI po wymianie klucza: 22 tury końcowego zestawu oraz 2 tury testu M04 w przeglądarce. Odbiór techniczny live przeszedł; jakość dialogu ma opisane uwagi i wymaga akceptacji człowieka. Windows, publiczny HTTPS, pilotaż i formalności pozostają otwarte. Repozytorium było puste; wskazany ZIP rozpakowano do katalogu głównego, zachowując specyfikacje, dane i walidator autora. Nie publikowano ani nie wysyłano zgłoszenia.

## Etapy
| Etap | Stan i dowód |
|---|---|
| E0 | WYKONANY. npm workspaces, strict TypeScript, React/Vite, Express, wspólne core/content/contracts, lockfile. `npm ci` odtworzone od zera. `npm run dev` i produkcyjny `npm start` działają. |
| E1 | WYKONANY. Parser bigint z dokładną redukcją i limitami; analityczne bramki, obrys, przeszkody i granice; pierwsze zdarzenie niezależne od priorytetu wyniku. SVG z równą skalą osi i animacją. 24 witness i 37 knownFailures przechodzą oczekiwane asercje. |
| E2 | WYKONANY. Cała M01: practice → teach → robot_transfer → human_check → podsumowanie. Dwie prognozy, własne wyjaśnienie, potwierdzana zasada, jawne demo offline, wersjonowany zapis i niezmienna pierwsza parsowalna próba. E2E oraz smoke Electron. |
| E3 | IMPLEMENTACJA I ODBIÓR TECHNICZNY LIVE WYKONANE. Responses API/Structured Outputs, sesje cookie/token, przeliczanie faktów, kanoniczna pamięć, izolacja scen, trwały limit SQLite, idempotencja, CAS, jeden retry formatu, wspólny deadline, refusal/incomplete/awarie. 32 przypadki INT, test oficjalnego SDK na HTTP stub oraz 22 rzeczywiste tury: PASS struktury i niezależnego sprawdzania. Prompt 1.0.2, gpt-5.4-mini-2026-03-17. Akceptacja jakości dialogu przez człowieka PENDING. |
| E4 | KAMPANIA WYKONANA. 6 misji i 24 oryginalne sceny, 18 wskazówek, odblokowania, archiwum, reset i wznowienie. Pełny E2E przechodzi także po porażce Piko w M04. Live sprawdzono teach/transfer wszystkich 6 umiejętności: 2 poprawne tory robota, 4 błędne odrzucone przez silnik. Rzeczywista M04 live w UI: PASS, także zachowanie pierwszej nieudanej próby po korekcie/reload. |
| E5 | CZĘŚĆ TECHNICZNA WYKONANA. 1366×768, 1440×900, 390×844; axe WCAG A/AA na home/practice bez naruszeń, oględziny zrzutów, klawiaturowa M01, reduced motion, 200% tekst, offline demo. PILOTAŻ 3–5 OSÓB: NOT RUN — wymaga uczestników. |
| E6 | LOKALNE WYDANIE I MATERIAŁY WYKONANE. ZIP Windows x64, inspekcja PE/ASAR, smoke Electron macOS, pięć PDF-ów, źródła z lockfile i notices, checklisty oraz rzeczywiste filmy M04: demo 37,56 s i live 45,28 s, MP4. Windows runtime, HTTPS jury i podpisy: osobne blokery. |

## Rzeczywiste wyniki poleceń
| Polecenie / kontrola | Wynik |
|---|---|
| `npm ci` | PASS; 610 pakietów z lockfile, 617 audytowanych. Ostrzeżenia narzędzi developerskich opisane poniżej. |
| `npm run dev` | PASS; Vite na 127.0.0.1:5173 i API live na 3001. Domyślny wybór w grze pozostaje jawnym demo; live wybiera gracz w ustawieniach. |
| `npm run build:content` | PASS; JSON Schema, 6/24 sceny, publiczne dane bez witness/knownFailures, wygenerowane typy i statyczne walidatory. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test -- --reporter=default --reporter=json --outputFile=checks/unit-results.json` | PASS, 158 testów w 7 plikach; raport rzeczywisty w checks/unit-results.json. |
| `npm run test:content` | PASS, 62 testy: schemat i wszystkie 24+37 fixture. |
| `python3 tools/validate_missions.py --json-report checks/math-validation-current.json` | PASS, 6 misji / 24 sceny / 24 witness / 37 knownFailures / 42 kontrole. |
| `python3 tools/audit_package.py` | PASS; niezależne rozwinięcie AST i nierówności na przedziałach, 24+37, 18 wskazówek; checks/independent-audit.json. |
| `npx tsx tools/report-evals.ts` | PASS; 32 deterministyczne INT PASSED. Ten raport bez API pozostawia SEM jako NOT RUN; rzeczywiste odpowiedzi są osobno w checks/ai-live-results.json i ai-semantic-review.json. |
| `npm run test:e2e` | PASS, 7 testów: kompletna kampania, pierwsza próba/reload/archiwum, 3 rozdzielczości/axe, awaria live, klawiatura/offline/200%. Raport checks/e2e-results.json. |
| `npm run test:ai:live` | PASS STRUCTURAL; 22/22 tury, dokładnie 22 żądania, prompt 1.0.2, gpt-5.4-mini-2026-03-17. 1069–2330 ms, mediana 1426 ms; 49505 tokenów wejścia / 2595 wyjścia. Bez retry w końcowym przebiegu. Uwagi jakościowe poniżej; to nie jest akceptacja semantyczna przez człowieka. |
| `npm run build` | PASS; frontend i samodzielny JavaScript serwera, bez zależności runtime od kodu TypeScript workspace. |
| `SERVER_PORT=3002 PUBLIC_ORIGIN=http://127.0.0.1:3002 npm start` | PASS; z produkcyjnego builda M01-practice daje sukces, API health HTTP 200, brak błędów strony. |
| `npm run desktop:dist` | PASS; release/bin/Naucz_Pilota_1.0.0_Windows_x64.zip, 153313090 bajtów. Niepodpisana paczka z EXE PE. |
| `npx tsx tools/smoke-desktop.ts` | PASS na macOS; lokalny app://, cała M01 offline, sandbox/contextIsolation, brak require/process w rendererze. |
| `npm run release:prepare` | PASS; folder 01–06, źródłowy ZIP tworzony przenośnie w Node 24, pięć PDF-ów, film i jawne braki formularzy. |
| Kontrola obu ZIP-ów i folderu | PASS; CRC obu archiwów, zgodność SHA-256 Windows, 13 wymaganych plików, 149 plików źródłowych zgodnych bajtowo z katalogiem roboczym, brak .env/node_modules/var i klucza. checks/package-audit.json. |
| `npm run release:check` | PASS LOCAL CHECKS; dane publiczne, renderer bez sekretów/author corpus/source maps/runtime eval, ASAR bez node_modules, PE. Live endpoint NOT READY; Windows runtime NOT RUN. SHA-256 w checks/release-check.json. |
| `npm audit --omit=dev --json` | PASS; 0 podatności produkcyjnych. |
| `npm audit` / `npm audit fix` | 15 moderate po celowanej aktualizacji minimatch >=9 do 11.0.4 (wcześniej 25). Pozostałe dotyczą starszego wywoływalnego API. Desktop nie zawiera tych zależności. |
| `npx tsx tools/record-demo.ts` / `--live` + konwersja ffmpeg | PASS; rzeczywiste UI M04 z napisami. Demo: 37,56 s. Live: 45,28 s, 2 rzeczywiste żądania, brak podmian odpowiedzi i błędów strony, pierwsza nieudana próba zachowana po korekcie/reload. MP4 1440×900; automatyczny pokaz, bez udawania pilotażu. |
| `tools/build-pdfs.py` | PASS w bundlowanym Pythonie autora; 5 PDF-ów. Po odbiorze live odświeżono instrukcję kompilacji (2 strony), raport (3) i opis (1); wyrenderowano i obejrzano wszystkie 6 zmienionych stron. Dwa pozostałe PDF-y zweryfikowano wcześniej. Gra nie wymaga Pythona. |
| `npm run docker:build` / `npm run docker:smoke` | PASS; Docker Desktop uruchomiony, obraz zbudowany, HTTP health, brak sekretów i danych autora, runtime bez root, sesja zachowana po restarcie z wolumenem. |

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
1. Przeczytaj już zapisane odpowiedzi live według rubryk i zatwierdź jakość dialogu. Przegląd asystenta wskazał dwie oceny różniące się od rubryki (SEM03: sound zamiast partial, SEM09: partial zamiast incorrect) i miejscami ton korepetytora. Nie trzeba ponawiać płatnych testów bez konkretnego powodu. Klucz i model są już skonfigurowane lokalnie.
2. Wdróż jedną instancję backendu na zaufanym HTTPS z trwałym wolumenem SQLite, ustaw distribution.json i przebuduj ZIP. Sprawdź połączenie z komputera odbiorcy. Nie publikowano w tym zadaniu.
3. Rozpakuj i odbierz paczkę na czystym Windows bez Node: offline, zapis/wznowienie, live i odłączenie sieci. Cross-build oraz smoke macOS nie zastępują tego testu.
4. Przeprowadź pilotaż 3–5 osób. Nie ma jeszcze wyników użyteczności od ludzi ani podstaw do twierdzeń o skuteczności edukacyjnej.
5. Sprawdź kwalifikację i formularze; uzupełnij własne dane i podpisy. Oficjalne źródła sprawdzono 3 listopada 2026, lokalne pobranie oryginałów zwróciło 403. Filmy demo i live są gotowe lokalnie. Publikacja, link chmurowy i wysłanie zgłoszenia pozostają po stronie autora.

## Następny krok
Lokalna implementacja i techniczny test live zakończone. Następne są akceptacja jakości dialogu oraz odbiory zewnętrzne powyżej. Nie oznaczać Windows, pilotażu ani zgłoszenia jako PASS na podstawie testów lokalnych. Nie utożsamiać strukturalnego PASS API z bezbłędnością modelu.

## Historia wcześniejszego odbioru — 2026-11-03
- Pierwszy commit bazowy: `5335952`; dalsza praca na `codex/release-readiness`. Przed commitem przeskanowano 111 plików tekstowych, bez wykrytych kluczy/kluczy prywatnych. `.env` jest ignorowany i ma uprawnienia 0600.
- Uruchomiono istniejący Docker Desktop. `docker build --pull -t naucz-pilota:codex-readiness .`: PASS. Obraz produkcyjny ma 0 podatności npm. Poprzedni blocker demona został usunięty.
- Zaktualizowano wybrane zależności minimatch w linii >=9 do 11.0.4; npm audit: 25 → 15 moderate (stare wywoływalne API w pozostałych narzędziach wymaga osobnej migracji). Lint i build przechodzą. Raport: checks/npm-audit-hardened.json.
- Poprawiono runner live: pojedyncza sesja teach/transfer, niezależne sprawdzenie wyników propozycji, zatrzymanie po błędzie, filtr --case, limit --max-calls i kody wyjścia odróżniające awarię od wykonania. Dodano cztery testy runnera; ostatni pełny wynik: 156 PASS.
- Rozszerzono smoke Electron o uruchamianie spakowanego EXE, błędną pierwszą próbę, korektę, rzeczywiste zamknięcie i ponowny start oraz porównanie zapisu. Lokalny test macOS PASS, także po rzeczywistym ponownym uruchomieniu; Windows nadal NOT RUN.
- Dodano ręczny workflow GitHub Actions Windows/Linux (wersje akcji przypięte do sprawdzonych SHA), protokół pilotażu i ręcznego odbioru Windows. Brak remote; workflow NOT RUN.
- Konfiguracja live: pusty .env przygotowany lokalnie; użytkownik otrzymał instrukcję bezpiecznego wklejenia klucza. Do czasu potwierdzenia konfiguracji nie wykonywano płatnych wywołań.

- Odbiór końcowy tej kontynuacji: npm ci, typecheck, lint, 156 testów, build, pakowanie Windows, kontrola wydania, kontener Docker, smoke Electron i 7 E2E — PASS. Poprawiono założenie portu losowego w smoke Docker po restarcie kontenera. Workflow YAML sprawdzono parserem; wykonanie Windows pozostaje NOT RUN.
- Sprawdzono aktualną oficjalną stronę i tekst regulaminu/załączników: termin 29.11.2026, film do 5 minut, opis do 1 strony. Lokalny download oryginałów otrzymał 403, bez fikcyjnych plików; adresy i status w checks/contest-sources.json oraz docs/konkurs/README.md.
- Odświeżono PDF kompilacji i raportu; oba mają po 2 strony, render sprawdzony wzrokowo. Pozostałe PDF-y i film demo zachowano. Publiczny backend nie został wdrożony, formularze nie są podpisane, pilotaż nie został przeprowadzony.
- Najbliższy krok: po zapisaniu przez użytkownika klucza w ignorowanym .env i potwierdzeniu „gotowe”, zatrzymać lokalny dev server i wykonać `npm run test:ai:live -- --case M01 --max-calls 4`. Odczytać prawdziwe odpowiedzi i dopiero wtedy zdecydować o pełnym zestawie. Do tego czasu status live NOT RUN, bez płatnych wywołań.

## Historia wymiany klucza API — 2026-11-03
- Użytkownik poprosił o wymianę klucza. Zatrzymano proces testu live i sprawdzono brak uruchomionych procesów runnera/backendu. Plik .env otwarto w TextEdit bez wypisywania sekretu.
- W tej sesji M01 live przeszła 2 wywołania. Pełniejszy test ujawnił sugestię reguły bez dowodu; zawężono schema dostawcy do bieżących faktów i dozwolonych reguł oraz doprecyzowano rolę Piko (prompt 1.0.2). Dwa nowe testy regresyjne przechodzą; łącznie 158 testów PASS. SEM05 po poprawce: PASS w 1 wywołaniu.
- Kolejny pełny przebieg live został przerwany na żądanie użytkownika przed końcowym raportem. Nie traktować poprzedniego checks/ai-live-results.json jako wyniku tego przerwanego przebiegu. Wywołanie już przyjęte przez dostawcę mogło zostać wykonane pomimo zatrzymania lokalnego procesu.
- Do wznowienia testów wymagane jest potwierdzenie zapisania nowego klucza. Nie wykonywać płatnych wywołań wcześniej. Prace nad narzędziem nagrania live są zapisane lokalnie, ale nagranie nie zostało jeszcze wykonane.

## Odbiór po wymianie klucza — 2026-11-03
- Po potwierdzeniu użytkownika sprawdzono nowy klucz. Pierwsza konfiguracja miała brak AI_MODEL i jeden dodatkowy znak przed tokenem; przywrócono model i usunięto ten znak bez wypisywania sekretu. Plik .env nadal jest ignorowany i ma uprawnienia 0600. Historyczna nieudana próba jest osobno w checks/ai-live-new-key-initial.json.
- M01 z nowym kluczem: 2 tury PASS strukturalnie. Następnie pełny końcowy przebieg: 22/22 PASS strukturalnie, 22 żądania, bez retry, prompt 1.0.2. Odpowiedzi i faktyczny model są zapisane w checks/ai-live-final-v1.0.2.json; bieżący raport jest identyczny. Wcześniejszych prób nie dolicza się do 22 końcowych żądań.
- Po zaobserwowanym błędzie SEM05 schemat dostawcy jest wyprowadzany z kanonicznego kontraktu i zawężany do dozwolonych reguł, identyfikatorów faktów i fazy. Nie dodano drugiego kontraktu ani autorytetu AI nad wynikiem. Dwie regresje przechodzą.
- Runner zapisuje wyniki po każdej turze i oznacza INTERRUPTED po sygnale zatrzymania. Nie maskuje przerwanego testu starym raportem.
- W sześciu transferach robot uzyskał 2 sukcesy i 4 porażki matematyczne. Nie podstawiono witness ani poprawionych wzorów. Wstępny przegląd dialogu asystenta ma uwagi; humanSignoff pozostaje PENDING.
- Przeglądarkowy pokaz live M04 wykonał kolejne 2 rzeczywiste żądania, zachował oryginalną błędną propozycję Piko i pierwszą nieudaną próbę gracza po korekcie oraz odświeżeniu. Nagranie MP4 45,28 s i raport checks/browser-live.json są gotowe.
- Po zmianach: 158 testów w 7 plikach, 7 E2E, typecheck, lint, kontrola wydania i ponownie zbudowany/sprawdzony kontener Docker — PASS. Publicznego hostingu nadal nie wdrożono. Lokalny backend jest uruchomiony z działającym kluczem.
- Końcowy build i lint po aktualizacji narzędzi wydania: PASS. Kontrola wydania uwzględnia wyłącznie pełny zestaw 22 tur dla bieżącej wersji promptu; test pojedynczej misji nie oznaczy całego live jako odebranego. Odświeżono trzy PDF-y i obejrzano 6 stron. Sprawdzono oba ZIP-y, aktualność 149 plików w źródłach i 13 wymaganych artefaktów. Skan 151 plików oraz ASAR nie wykrył sekretu; .env nie jest śledzony w Git.
