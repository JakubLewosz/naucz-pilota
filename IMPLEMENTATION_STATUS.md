# Stan implementacji — Naucz Pilota
Aktualizacja: 2026-11-10. Środowisko: macOS arm64, Node 24.11.0, npm 11.6.1.

Bieżąca praca jest na lokalnej gałęzi `codex/jury-readiness`, od czystej bazy `f1e059d`. Bazę potwierdzono na zdalnym `main` i tagu `v1.0.0`. Wcześniejsze sprawdzenia odbioru jury wykonano na `f9efdbc22de7a4fc1a1c366e76cd00b882907642`. Próbę M04 live z GPT-5.4 mini wykonano na `a751a1c`, a z GPT-6 Luna na `95a55ca`.

## Kandydat konkursowy po próbie M04

Kod interfejsu i testów zapisano w `2c0ffe7`, a wdrożenie i dystrybucję w `4c779ff`. Konfiguracja używa GPT-6 Luna Extra High z promptem 1.2.0. W tej rundzie wykonano **0 płatnych wywołań API**. Wynik 7/7 otrzymanych propozycji Luny przyjęto jako pozytywny dla doboru wzoru na dwóch geometriach. Ósma próba z wcześniejszego testu pozostaje timeoutem.

- Oczekiwanie opisuje, co gracz może zrobić po odpowiedzi, oraz co zachowuje pominięcie. Komentarz Piko i obliczone wartości mają oddzielne sekcje. Po przewidywaniu wynik pokazuje oryginalny sprawdzony wzór i punkty z lokalnego silnika. Kryteria zaliczenia i blokada pierwszej samodzielnej próby korzystają z dotychczasowych reguł.
- Stack Compose/Caddy ogranicza dostęp po IP/CIDR, zachowuje certyfikaty i SQLite oraz uruchamia backend z domyślnym budżetem zero. Test lokalny stosuje ten sam Caddyfile z odizolowaną siecią zamiast linuksowego trybu host. Klucz testowy był syntetyczny. W pakiecie Windows zapisuje się wyłącznie publiczny origin podany przy budowie.
- Materiały obejmują pięć aktualnych PDF-ów, scenopis 4 min 20 s, klip demo M04 40,92 s i protokół pilotażu dla 3–5 osób. Klip pokazuje `START_MISS` oraz zachowanie pierwszej próby po korekcie i odświeżeniu. Źródła i materiały do odbioru są zebrane lokalnie w `var/jury-candidate/zgloszenie/`. [Checklista UwB](release/CHECKLISTA.md) · [Scenopis](docs/18-film-konkursowy.md) · [Pilotaż](docs/15-pilotaz.md)

| Sprawdzenie | Rzeczywisty wynik |
|---|---|
| `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` | PASS, 206 testów Vitest w 8 plikach. |
| `npm run test:content`, `tools/validate_missions.py`, `tools/audit_package.py` | PASS, 62 testy treści, 24 poprawne tory, 37 kontrolnych porażek i 42 kontrole walidatora. |
| `npm run test:e2e` w demo i z atrapami | PASS, 15 testów w 50,7 s. Po 21 s spóźniona odpowiedź nie zmieniła samodzielnej próby. Celowo błędna wysokość i fałszywa walidacja transportu nie zmieniły wyniku silnika. |
| `npm run test:m04:offline`, `npm run docker:smoke` | PASS, 16 przypadków M04 z atrapą i kontener z trwałą sesją po restarcie. |
| `npm run jury:https:smoke` | PASS. Zaufany TLS, odrzucony niezaufany certyfikat, sieci dozwolona i odrzucona, podrobione nagłówki, Secure cookie, obcy origin, limit 16 KiB, HTTP 429 z `requestCount=0` i sesja po restarcie. |
| Spakowany Electron macOS | PASS, M01 offline i zachowanie pierwszej próby po restarcie. W osobnej próbie HTTPS z atrapą odrzucono niezaufany certyfikat, odebrano odpowiedź po 17 s, wyczyszczono historię, sprawdzono lot i jawną awarię sieci. |
| Windows x64, `release:check`, `unzip -tq` | PASS cross-build i inspekcja obu ZIP-ów, PE i ASAR. Demo ma pusty origin. Wariant do smoke ma `https://127.0.0.1:3443`. Aktualny workflow Windows jest gotowy do uruchomienia, jego wykonanie **NOT RUN**. |
| Wymogi UwB, opis i film | Oficjalna strona potwierdza termin 29.11.2026 oraz wymagane materiały. Aktualny opis ma jedną stronę. Lokalna próba pobrania regulaminu i załączników PDF zwróciła HTTP 403. Finalny film pozostaje **NOT RUN**. |

**Gotowość**. Można pokazać aktualne demo lokalnie oraz wyniki wcześniejszego testu Luny. Docelowy HTTPS z sieci jury, paczka skierowana do tego hosta, uruchomienie obecnego EXE na Windows, pilotaż, finalny montaż, formularze i udostępnienie zgłoszenia pozostają **NOT RUN**. [Raport maszynowy](checks/jury-candidate.json) · [Odbiór Windows](docs/16-windows-odbior.md) · [Odbiór HTTPS](docs/17-odbior-live.md)

## Dwie nowe geometrie M04 na żywo z promptem 1.2.0

- Na `21ed51b` wykorzystano limit **8 prób HTTP**, bez ponowień. `gpt-6-luna` z `xhigh` podała siedem wzorów, które silnik zaliczył. Na translacji −4 wszystkie cztery warunki dały `0.25*(x+2)^2`. Na przebudowanej A/B/C dały `0.5*(x-4)^2+1`, a D zakończyło się `AI_TIMEOUT` w trakcie uśpienia hosta. Koszt tej ostatniej tury pozostaje nieustalony.
- Testowe wejście zawierało symboliczną regułę i geometrię, a wzory kontrolne były dostępne tylko lokalnemu silnikowi. Otrzymane komentarze poprawnie rozróżniły A/B/C/D i podały poprawne wysokości w punktach. Notatki zmieniły argumentację. W warunkach, które zwróciły odpowiedź, wybór wielomianu w obrębie planszy był taki sam.
- Siedem raportów zużycia zawiera 28 996 tokenów, w tym 9 784 tokeny rozumowania, za szacowane 0,006301720 USD. Mediana czasu odpowiedzi to 16,521 s. Przeszło 20 lokalnych testów geometrii i kontekstu oraz kontrola krótkiego timeoutu z atrapą.
- Przebieg sprawdził uogólnienie w aparaturze testowej. Pełny odbiór 1.2.0 z UI gry, zewnętrzny HTTPS, Windows odbiorcy i pilotaż pozostają **NOT RUN**. Do uzupełnienia jest kontrola D na przebudowanej planszy. [Ocena i cytaty](checks/m04-generalization-1.2.0.live.md) · [Surowy zapis](checks/m04-generalization-1.2.0.live.json).

## Transfer M04 i odbiór lokalny promptu 1.2.0

- `bab6283` dodaje cztery geometrie testowe, warunki A/B/C/D i instrukcję sprawdzania punktów bieżącej trasy przed podaniem wzoru. Transfer wykonuje jedno żądanie dostawcy na turę. Model roboczy to GPT-6 Luna Extra High.
- `b8502bd` oddziela opinię Piko o notatce od wyniku silnika. Umożliwia pominięcie podczas oczekiwania i zapisuje je jako `skipped`. Test ze spóźnioną odpowiedzią po 21 s potwierdził ochronę pierwszej próby i archiwum.
- PASS dla kodu `b8502bd`: typecheck, lint, build, 206 testów Vitest, 62 testy treści, walidatory matematyki, Electron na macOS, build i smoke Docker. Playwright przeszedł 15 testów po synchronizacji regresji odświeżenia w `6370947`. Cross-build Windows x64 przeszedł inspekcję PE, ASAR i ZIP. Lokalna kontrola wydania oznaczyła starszą paczkę w `release/bin` jako STALE.
- Testy geometrii potwierdziły 4 bezpieczne tory kontrolne i 4 kontrolne `START_MISS`. Historyczny wzór `0.25*(x-2)^2` odrzucono na wszystkich czterech. W 16 turach aparatury z atrapą sprawdzono schemat, role wiadomości, brak rozwiązań w kontekście i zachowanie oryginalnych propozycji.
- Etap implementacji wykorzystał **0 płatnych wywołań** i przygotował [protokół do 8 wywołań](docs/17-odbior-live.md#uogólnienie-m04-na-czterech-geometriach-testowych), opis jednostronicowy, instrukcję PDF i scenopis 4 min 20 s. Windows CI bieżącego kodu, osobny Windows, zewnętrzny HTTPS, pilotaż i aktualne nagranie pozostają **NOT RUN**.

Demo jest gotowe do lokalnej próby prezentacji. Pełny odbiór wymaga jeszcze sprawdzenia aktualnego promptu w interfejsie gry i na docelowym urządzeniu. [Raport testów i odbioru](checks/m04-generalization-1.2.0.md) · [Surowe wyniki atrapy](checks/m04-generalization-1.2.0.mock.json).

## M04 A/B/C live z GPT-6 Luna xhigh

Próba z 10 listopada na `95a55ca` przeszła lokalnie w Chromium z promptem 1.1.0. W trzech osobnych sesjach wykonano **6/6** zatwierdzonych żądań, bez ponowień. Wszystkie odpowiedzi HTTP 200 miały status `completed`. Niezależny silnik zaliczył **3/3** pierwsze loty Luny przy tym samym wielomianie `0.25(x-2)^2`. W historycznym przebiegu GPT-5.4 mini każdy z trzech lotów zakończył się `START_MISS`. Build przed próbą przeszedł.

Luna odniosła się do poprawnego wyjaśnienia w A, odrzuciła błąd w B i wskazała brak użytecznej wskazówki w C. Średni czas odpowiedzi wyniósł 8,27 s wobec 2,84 s dla mini. Zużycie Luny to 22 821 tokenów, w tym 4 440 tokenów rozumowania. Koszt według zużycia API i cennika Standard wyniósł 0,003463335 USD wobec 0,009369450 USD dla mini.

Luna nadaje się do kontrolowanego pokazu M04. Wybór domyślnego modelu dla całej gry wymaga sprawdzenia powtarzalności i czasu odpowiedzi. Reguła M04 przekazywana Piko zawiera już przykład `(x-2)`, więc warto przetestować planszę, która wymaga innej wartości `p`. Odbiór transkryptu przez człowieka ma status **NOT REVIEWED**. Publiczny HTTPS i odbiór na Windows pozostają **NOT RUN**. [Raport porównawczy](checks/ai-live-m04-abc-luna-xhigh-1.1.0.md) · [Zapis wypowiedzi i użycia API](checks/ai-live-m04-abc-luna-xhigh-1.1.0.json).

## GPT-6 Luna z Extra High

Commit `9e32afe` ujednolica konfigurację serwera i obu runnerów live. SDK wysyła `gpt-6-luna`, `reasoning.effort=xhigh` i limit 8192 tokenów. Tura ma domyślnie 90 s, w tym ewentualne techniczne ponowienie. Relay Electron i narzędzia przeglądarkowe dają 130 s na odpowiedź. W grze widać stan oczekiwania. Timeout, odrzucenie konfiguracji modelu i odpowiedź niekompletna są jawnymi błędami. Lokalny `.env` zawiera nowe jawne ustawienia, a `/api/health` zbudowanej aplikacji potwierdził konfigurację bez tury u dostawcy.

| Sprawdzenie | Wynik dla `9e32afe` |
|---|---|
| `npm run typecheck`, `npm run lint`, `npm run build` | PASS. Walidacja i build obejmują 6 misji i 24 sceny. |
| `npm test` | PASS, 185 w 7 plikach. Atrapa SDK obsłużyła `completed`, `incomplete`, odmowę i HTTP 400, 404, 429. Jeden request na przypadek. |
| `npm run test:content`, walidator i niezależny audyt Python | PASS, 62 testy treści, 24 poprawne tory, 37 znanych błędów i 42 kontrole walidatora. |
| E2E Chromium w demo i z lokalnymi atrapami | PASS, 12 testów w 21,2 s. |
| M04 A/B/C w Chromium z `--mock` | PASS w trzech sesjach. 7 prób z jednym celowym technicznym ponowieniem, 0 rzeczywistych żądań OpenAI. |
| `npx tsx tools/smoke-desktop-relay.ts` | PASS na macOS. Relay odebrał odpowiedź atrapy po 17 s, po uprzednim wyczyszczeniu kontekstu. UI pokazało oczekiwanie. |
| Cross-build Windows x64 i inspekcja PE, ASAR i ZIP | PASS na macOS. Paczka testowa zawiera bieżący relay i konfigurację demo. Uruchomienie EXE na Windows **NOT RUN**. |
| Prawdziwe GPT-6 Luna `xhigh` na etapie integracji | Wówczas **NOT RUN**. Wynik nowszej próby na `95a55ca` jest powyżej. |

Na etapie integracji wykorzystano 0 płatnych wywołań. Pełne [body z atrapy HTTP](checks/luna-xhigh-http-stub-request.json) dokumentuje ustawienia adaptera. [Protokół próby na maksymalnie sześć wywołań](docs/19-gpt-6-luna-xhigh.md) opisuje nowszy przebieg live.

## M04 A/B/C live z GPT-5.4 mini

Lokalny Chromium i backend sprawdziły pełny przepływ w trzech nowych sesjach z jednakowego stanu. Po rozmowie zapisano rzeczywiste parafrazy i odświeżono grę. SDK przekazał potwierdzony tekst i parafrazę do OpenAI. Następnie interfejs pokazał wynik silnika dla każdej faktycznej propozycji.

| Warstwa | Wynik |
|---|---|
| Rozmowa teach | PASS semantyczny w rozróżnieniu treści. A `sound`, B `incorrect`, C `not_applicable`. |
| Zapis, odświeżenie, żądanie transferu, zgodność silnika z UI | PASS techniczny we wszystkich trzech sesjach. |
| Transfer A | Częściowe odniesienie do lekcji, przepisany wzór początkowy `0.25(x+2)^2`, `START_MISS`. |
| Transfer B | Ogólny komentarz bez odrzucenia błędnego wyjaśnienia, `0.25(x-1)^2`, `START_MISS`. |
| Transfer C | Wskazanie reguły bez wyjaśnienia, czemu pominięto „abc”, `0.25(x-0)^2`, `START_MISS`. |
| Budżet i zużycie | 6/12 rzeczywistych żądań, zero ponowień. `gpt-5.4-mini-2026-03-17`, 18 384 tokeny, koszt szacunkowy 0,00936945 USD. |
| Próba techniczna `--mock` | PASS wszystkich trzech sesji, 7 prób po celowym ponowieniu, 0 żądań OpenAI. |
| `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` | PASS, 183 testy w 7 plikach. |
| `CI=1 AI_MODE=demo STATE_DB_PATH=:memory: npm run test:e2e` | PASS, 12 testów w Chromium, bez OpenAI. |

Transfer GPT-5.4 mini wymaga poprawy jako demonstracja zastosowania wyjaśnienia do nowej geometrii. Proponowana zmiana promptu rozdziela decyzję o wykorzystaniu notatki od wyprowadzenia wierzchołka i sprawdzenia wzoru z danymi trasy. [Raport M04 A/B/C](checks/ai-live-m04-abc-1.1.0.md) · [Surowy zapis live](checks/ai-live-m04-abc-1.1.0.json). Pełny zestaw 22 tur, HTTPS i Windows odbiorcy pozostają **NOT RUN** dla tej gałęzi. Odbiór transkryptów przez człowieka pozostaje **NOT REVIEWED**.

## Przygotowanie odbioru jury

- **Lekcja.** Po zapisie i odświeżeniu aplikacja przekazuje dokładne słowa gracza z bieżącego podejścia. Kontrakt przepuszcza notatkę transferu wraz z poprawnym dowodem, potwierdzoną regułą i zgodnym ID. Brak lub błąd bieżącego dowodu usuwa notatkę z kontekstu, nawet gdy serwer zna wcześniejszą lekcję. Test z lokalnym HTTP SDK pokazuje tekst w roli user oraz kanoniczną regułę w roli developer.
- **Dziennik.** Na bazie f1e059d regresja znalazła w DOM jedną regułę M02 w dzienniku otwartym z M01 przed samodzielną próbą M02. Oczekiwano zera. Po poprawce widoczność zależy od pierwszej parsowalnej próby misji wpisu. Zasada jest ukryta także w podsumowaniu kampanii i w pamięci przekazywanej Piko z innej misji. Bieżący transfer nadal otrzymuje własną potwierdzoną lekcję. Replay wymaga własnej pierwszej próby, a archiwum wcześniejszego podejścia zachowuje wynik. Dziennik ustawia afterReview tylko dla wyświetlonych zasad.
- **Demo.** A/B/C M04 mają identyczny przygotowany komentarz, wzór i walidację mechaniczną. W UI rozróżniono tekst gracza, gotowy komentarz i sprawdzoną regułę. Zaliczenie liczy silnik.
- **Live.** Zestaw standardowy nadal ma 22 tury. Filtr M04-LESSONS obejmuje sześć tur w trzech sesjach z przygotowanymi notatkami. Runner przeglądarkowy powyżej sprawdza zapis rzeczywistej parafrazy. Oba wymagają jawnej zgody i budżetu oraz zapisują osobny transkrypt dla każdego uruchomienia.
- **Materiały.** Gotowe są instrukcja HTTPS i odbioru z innego urządzenia, scenopis 4 min 20 s, kryteria pilotażu i checklista. Oficjalna strona potwierdziła termin i wymagania materiałów. Dokumentacja wydania v1.0.0 i stare filmy opisują wcześniejszy kod.

### Wyniki sprawdzeń

| Polecenie lub warstwa | Wynik |
|---|---|
| `npm run typecheck`, `npm run lint`, `npm run build` | PASS na macOS arm64 z Node 24.11.0. |
| `npm test -- --reporter=default --reporter=json --outputFile=checks/unit-results.json` | PASS, 183 w 7 plikach. |
| `npm run test:content`, walidator Python i niezależny audyt treści | PASS, 62 testy treści, 24 poprawne tory, 37 znanych błędów, 42 kontrole. Weryfikację Python wykonano na fa8326b, a treść i silnik są identyczne w sprawdzonym commicie. |
| `CI=1 AI_MODE=demo STATE_DB_PATH=:memory: npm run test:e2e` | PASS, 12 testów Chromium. Pełna kampania, regresja nawigacji z reloadem i migracją v1, replay, podsumowanie kampanii, WCAG A/AA w badanych widokach, klawiatura i offline. |
| UI → API → SDK | MOCK PASS. HTTP dostawcy działało na loopback. Surowe zdanie gracza i źródło parafrazy sprawdzono w faktycznym żądaniu SDK. |
| `npm run test:ai:live -- --dry-run --case M04-LESSONS --max-calls 12` oraz sucha próba standardowa | Na fa8326b PASS wejść. Sześć tur i trzy notatki M04, 22 tury i sześć notatek standardu. Zablokowane próby bez zgody lub poświadczeń zwróciły kod 2 i NOT RUN. Razem 0 wywołań dostawcy. |
| `npm run docker:build`, `npm run docker:smoke` | PASS lokalnie. Health w demo, brak kluczy i korpusu autora w obrazie, użytkownik bez root, trwała sesja po restarcie. |
| `npm run desktop:smoke`, `npx tsx tools/smoke-desktop-relay.ts` | PASS na macOS. Offline M01 i restart, relay i reset z trzema odpowiedziami atrapy. |
| `npm run release:check` | PASS LOCAL CHECKS renderera. Lokalna paczka desktop ma status STALE, zatem jej inspekcja pozostaje dowodem historycznym. |
| Standardowy zestaw 22 tur live / SEMANTIC HUMAN REVIEW | NOT RUN / NOT REVIEWED dla promptu 1.1.0. Historyczny raport 22/22 dotyczy promptu 1.0.2. Odrębna próba M04 na 1.1.0 jest opisana wyżej. |
| EXE WINDOWS RUN / HTTPS REMOTE RUN | NOT RUN dla bieżącej gałęzi. Historyczny Windows CI PASS dotyczy 52ac710. Publiczny origin oraz osobny komputer odbiorcy wymagają odbioru. |
| Aktualny film, pilotaż, zgłoszenie | NOT RUN. Dostępne są procedury i checklista do wykonania. |

### Pliki i commity

- `e49ae62` — `apps/web/src/App.tsx`, `review.ts`, `state.ts`, `save.ts`, kontrakty, runner `tests/live/` i regresje w `tests/ai.test.ts`, `tests/live-runner.test.ts`, `tests/e2e/campaign.spec.ts` oraz `tests/e2e/lesson.spec.ts`.
- `1bd3f8c` — jawny tekst demo w `packages/contracts/src/index.ts` i `App.tsx` oraz porównanie trzech wariantów.
- `fa8326b` — `docs/17-odbior-live.md`, `docs/18-film-konkursowy.md`, aktualizacja instrukcji, pilotażu i `release/CHECKLISTA.md` oraz `tools/release-check.ts`.
- `f9efdbc` — filtr kontekstu Piko w `review.ts` i `App.tsx`, kontrakt w dokumentacji oraz test stanu.
- `a751a1c` — limitowany runner przeglądarkowy M04 A/B/C i możliwość wstrzyknięcia `fetch` do SDK w teście.
- Raport maszynowy jest w `checks/jury-readiness.json`. Pełna lista plików wynika z `git diff --name-only f1e059d..HEAD`.

### Decyzja o odbiorze

Gotowe do lokalnego przeglądu demo, mock i technicznego przepływu M04 live. Niegotowe do pełnej próby jury live. Trzy kolejne kroki:

1. Poprawić instrukcję transferu i po osobnej zgodzie budżetowej powtórzyć M04 A/B/C z rubryką semantyczną.
2. Zapewnić ograniczony HTTPS, trwały wolumen oraz odbiór z innej sieci i na osobnym komputerze Windows.
3. Przeprowadzić pilotaż 3–5 osób, nagrać aktualny film i uzgodnić końcową wersję materiałów z podpisanymi formularzami.

## Poprawki po audycie fef5e22 (9 listopada 2026)

- **Odzyskiwanie AI.** Błędy transportu i koperty unavailable nie zużywają dwóch miejsc na propozycje. Dwie nieudane tury live na lot Piko ograniczają ponowienia także po odświeżeniu. Gracz może jawnie wybrać demo lub pominąć lot. Udana odpowiedź przywraca plakietkę live. Poprzednie wypowiedzi zachowują oznaczenie źródła.
- **Rozmowa i zapis.** Przycisk czyszczenia w web i Electron resetuje kontekst tej sceny w aktywnej sesji SQLite oraz usuwa tekst z jej kopert. Dowody, liczniki i zapisane wyniki pozostają. Zapis wersji 2 waliduje zagnieżdżone pola i migruje wersję 1. Przy błędnym odczycie lub zapisie aplikacja pokazuje odzyskiwanie i chroni oryginał.
- **Lekcja Piko.** Potwierdzona notatka zawiera słowa gracza i opcjonalną parafrazę. Bieżący transfer otrzymuje notatkę obok zweryfikowanej reguły. Oba cytaty są danymi użytkownika. Ocena tekstu nie wpływa na sprawdzenie wzoru i prognoz. Porównanie kontekstu z notatką i bez niej oraz test roli wiadomości przeszły z atrapą.
- **Electron.** Pierwsza próba lokalnej rozmowy ujawniła preflight kończący się 403 przed ustanowieniem sesji. Proces główny wysyła teraz bezpośrednie żądania z ustalonym nagłówkiem i tokenem. Regresja IPC przeszła na macOS i Windows z trzema odpowiedziami atrapy i bez płatnego API.
- **Interfejs.** Widoczne etapy naprawy, prognoz, wyjaśnienia i zapisu lekcji, obie strony rozmowy, współczynniki a/b/c, polskie nazwy zdarzeń. Utrzymano brak podpowiedzi przed pierwszą samodzielną próbą.

| Sprawdzenie | Wynik dla poprawek |
|---|---|
| Typecheck, lint, Vitest | PASS, 174 testy w 7 plikach. |
| Playwright | PASS, 10 testów. Obie ścieżki po dwóch awariach i odświeżeniu, odzyskany live, czyszczenie w demo po użyciu live. Pierwsze uruchomienie regresji ujawniło problem z importem JSON w runnerze, drugie niejednoznaczny selektor nagłówka. Pełne powtórzenie po poprawkach przeszło. |
| Walidator i niezależny audyt treści | PASS, 24 rozwiązania, 37 błędów, 42 kontrole, 18 wskazówek. |
| Build, Docker, Electron macOS | PASS. Kontener zachowuje sesję po restarcie z wolumenem. Electron przeszedł M01 i ponowny start. |
| Cross-build Windows i kontrola wydania | PASS. ZIP x64, PE i ASAR zweryfikowane lokalnie. |
| Ekran teach na laptopie i przy 200% | PASS. Sprawdzono widok 1366×768 i zrzut karty. Axe WCAG A/AA na teach bez wykrytych naruszeń. Zatwierdzenie klawiaturą i brak przewijania w poziomie przy 200%. |
| GitHub Actions Windows i Linux | PASS. Pierwszy przebieg 42684434332 dla 9293056. Powtórzenie 42685071630 dla 52ac710 po poprawce transportu przeszło oba zadania, w tym start i restart spakowanego EXE oraz nowy test relay z lokalną atrapą. Próba na osobnym komputerze odbiorcy ma status NOT RUN. |
| Płatny test promptu 1.1.0 na etapie audytu | Wówczas NOT RUN, 0 wywołań. Nowszy przebieg M04 jest opisany wyżej. Historyczny raport 22 tur i dwa filmy odnoszą się do wersji sprzed audytu. |
| HTTPS z innego urządzenia, pilotaż | NOT RUN. Endpoint w distribution.json pozostaje pusty. |

Kod sprawdzony w Actions jest na gałęzi `codex/audit-fixes`. [Końcowy przebieg Windows i Linux](https://github.com/JakubLewosz/naucz-pilota/actions/runs/42685071630). Zmieniono moduły stanu i zapisu w `apps/web/src`, kontrakt i kontekst w `contracts` oraz `packages/contracts`, reset w `apps/server/src/app.ts` i `store.ts`, relay i preload Electrona oraz regresje w `tests` i `tools/smoke-desktop-relay.ts`. Szczegółowe dane wydania są w `checks/windows-actions-audit.json`. Oba filmy pozostają dokumentacją wcześniejszego interfejsu.

## Etapy pierwotnego wdrożenia (3 listopada 2026)
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

## Repozytorium GitHub — 2026-11-03
- Na wyraźne polecenie użytkownika dodano origin https://github.com/JakubLewosz/naucz-pilota.git. Repozytorium zdalne było puste. Wysłano pełną historię projektu (do 95067e1) na main i codex/release-readiness, bez force push.
- Przed wysłaniem przeskanowano wszystkie 200 blobów w historii obu gałęzi: PASS, bez kluczy API i kluczy prywatnych. .env pozostaje ignorowany.
- Do repozytorium dołączono oba rzeczywiste nagrania MP4. ZIP Windows ma 153313090 bajtów i pozostaje poza Git; dostępne są kod, konfiguracja i komenda odtworzenia. Nie utworzono GitHub Release ani nie wdrożono hostingu.
- Workflow GitHub Actions nadal NOT RUN; można uruchomić go ręcznie w Actions. Wcześniejsze raporty opisujące brak remote dotyczą stanu sprzed tego pushu.
