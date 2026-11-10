# Odbiór lokalny transferu M04 z promptem 1.2.0

10 listopada 2026. Gałąź `codex/jury-readiness`, czysta baza `2fffc8b`, kod po zmianach i użyty w pomiarach `b8502bd014904d4210c16df87145d18c768029a8`. Środowisko to macOS arm64, Node 24.11.0, Chromium, Electron i lokalny Docker Desktop z kontenerem Linux.

Ten raport opisuje etap implementacji i sprawdzenia bezpłatne. [Późniejszy przebieg z prawdziwą Luną](m04-generalization-1.2.0.live.md).

- `bab6283` wprowadza geometrię testową i runner A/B/C/D, prompt 1.2.0 oraz jedno żądanie dostawcy na turę transferu.
- `b8502bd` rozdziela opinię Piko o wyjaśnieniu od wyniku silnika, dodaje pominięcie transferu i sprawdza zapisy oraz spóźnione odpowiedzi.
- `6370947` synchronizuje regresję odświeżenia po dwóch awariach. Końcowe E2E uruchomiono po tym commicie.
- Listę plików kodu pokazuje `git diff --name-only 2fffc8b..b8502bd`. Commit z tym raportem zawiera również dokumentację odbioru, materiały konkursowe i wygenerowane PDF-y. Model roboczy to GPT-6 Luna Extra High z 8192 tokenami i 90 s na turę. Produkcyjna kampania ma 6 misji i 24 sceny, a geometrie poniżej należą do testów.

## Sprawdzenie geometrii i kontekstu

Trzy translacje przesuwają domenę, start, metę, bramki, przeszkodę oraz wzór początkowy w osi x. Dwie translacje są ustalone w protokole, a trzecią wybrano deterministycznie przy seedzie 20261110. Czwarta plansza ma asymetryczne otwory, inny współczynnik i wysokość wierzchołka oraz inną przeszkodę. Wartości kontrolne powstały z geometrii przed próbami z atrapą.

| Geometria | Referencja sprawdzona przez silnik | Negatywny wzór startowy | Historyczny `0.25*(x-2)^2` |
|---|---|---|---|
| Translacja −4 | `0.25(x-(-2))^2` · SUCCESS | START_MISS | odrzucony |
| Translacja +3 | `0.25(x-(5))^2` · SUCCESS | START_MISS | odrzucony |
| Translacja −6 | `0.25(x-(-4))^2` · SUCCESS | START_MISS | odrzucony |
| Przebudowana | `0.5(x-4)^2+1` · SUCCESS | START_MISS | odrzucony |

Każda geometria ma cztery warunki. A to poprawna metoda, B błędny kierunek, C to `abc`, a D to kontrola bez notatki. Produkcyjny `buildContext` weryfikuje tę samą naprawę oraz dwie prognozy i dopuszcza ten sam identyfikator reguły. W teście A/B/C zapis ma `source: skipped` i pustą parafrazę, aby zmieniać tylko treść gracza. Osobny test przeglądarkowy sprawdza faktyczną parafrazę atrapy i zapis po odświeżeniu. W ewaluacji tekst reguły jest symboliczny. Produkcyjny przykład liczbowy z M04 nie trafia do testowego kontekstu.

Przechwycone żądania SDK mają równoważny kontekst `developer` w ramach danej geometrii. Dosłowna notatka A/B/C jest w wiadomości `user`. D wysyła tę samą sprawdzoną regułę i geometrię bez notatki. Porównanie obejmuje też zgodność schematu, `store:false`, brak odpowiedzi wzorcowej oraz brak geometrii samodzielnego lotu w żądaniu. Dane testowe i klucz nie wystąpiły w sprawdzonych plikach builda web, serwera ani ASAR.

W 16 turach atrapa zwróciła **8 propozycji zaliczonych przez silnik, 4 `START_MISS` i 4 braki propozycji**. Odpowiedzi atrapy zależą wyłącznie od geometrii. Wszystkie warunki jednej planszy dostają tę samą odpowiedź. Test techniczny potwierdził zachowanie oryginalnego błędnego wzoru. Osobna regresja interfejsu pokazała, że zaliczenie lotu nie zmienia opinii o notatce. Ocena językowa modelu pozostaje **NOT REVIEWED**. [Surowy JSON z atrapy](m04-generalization-1.2.0.mock.json).

## Zmiany rozgrywki

Prompt 1.2.0 prosi Piko o sprawdzenie wysokości na starcie, w bramkach i na mecie oraz uwzględnienie domeny i przeszkód. Komentarz ma odnieść się do bieżącej geometrii i wyjaśnić użycie, odrzucenie lub brak notatki. Zaliczenie rozstrzyga silnik. W transferze błąd formatu wraca po jednym żądaniu. W nauczaniu możliwa jest jedna ograniczona naprawa techniczna.

Opinia o tekście jest oznaczona jako wypowiedź modelu i pozostaje oddzielna od kontroli liczb oraz wyniku lotu. Po `START_MISS` gra pokazuje wysokość wyliczoną przez silnik i przedział otworu. W trakcie oczekiwania gracz może pominąć lot. Zapis przechowuje `skipped` bez dodawania próby robota. Spóźniona odpowiedź nie zmienia samodzielnej sceny, pierwszej próby ani archiwum. Dodatkowe pola w zapisie wersji 2 są opcjonalne, dzięki czemu wcześniejsze zapisy nadal się wczytują.

## Weryfikacja wykonana

| Komenda lub kontrola | Wynik | Dowód |
|---|---|---|
| `npm run typecheck`, `npm run lint`, `npm run build` | PASS | Sprawdzenie TypeScript, ESLint, renderer Vite i backend. |
| `npm test` | PASS | 206 testów w 8 plikach, w tym 20 testów czterech geometrii i warunków A/B/C/D. |
| `npm run test:m04:offline` | PASS | 16 odpowiedzi SDK z atrapą, 0 żądań OpenAI. Próbę uruchomienia z niedozwolonym limitem 9 runner odrzucił przed wysłaniem żądania. |
| `npm run test:ai:live -- --dry-run --case M04-LESSONS --max-calls 12` | PASS wejść | Wywołania modelu NOT RUN, licznik 0. |
| `CI=1 AI_MODE=demo OPENAI_API_KEY= STATE_DB_PATH=:memory: npm run test:e2e` | PASS | 15 testów w 44,4 s. Cała kampania, B/C przy poprawnym locie oraz pominięcie po podwójnym kliknięciu przy odpowiedzi atrapy opóźnionej o 21 s. Sprawdzono klawiaturę, 1366×768, 390×844 i powiększenie tekstu do 200%. |
| `npx tsx tests/live/m04-browser.ts --mock jury-1-2-0` | PASS | Trzy sesje, 7 wywołań atrapy z jednym celowym ponowieniem w nauczaniu, 0 żądań OpenAI. |
| `npm run test:content`, `python3 tools/validate_missions.py`, `python3 tools/audit_package.py` | PASS | 62 testy treści, 24 tory referencyjne, 37 znanych błędów, 42 kontrole parsera i geometrii. |
| `npm run desktop:smoke`, `npx tsx tools/smoke-desktop-relay.ts` | PASS na macOS | M01, izolacja i restart. Relay zachował oczekiwanie przez 17 s w próbie z lokalną atrapą oraz wyczyścił kontekst rozmowy. |
| `npm run docker:build`, `npm run docker:smoke` | PASS | `npm ci` wewnątrz obrazu, demo, trwały zapis SQLite, proces bez root i brak sekretów oraz korpusu autora. |
| `npm run release:check` | PASS LOCAL CHECKS | Bieżący renderer i publiczna treść przeszły kontrolę. Starszy pakiet w `release/bin` ma status STALE. |
| Cross-build Windows x64 na macOS | PASS kompilacji i inspekcji | Aktualny renderer i relay, pusty adres HTTPS, poprawne PE, ASAR i ZIP. SHA-256 paczki testowej `932a0597fdf09c90755339f6f434c8b424f99675d6eff2fa0fe90f596d30857e`. |
| Opis i instrukcja PDF | PASS | Opis 1 strona, instrukcja 2 strony. Wszystkie trzy strony wyrenderowano i sprawdzono wizualnie. |

Pierwsze uruchomienia wykryły błędy w nowej aparaturze. Poprawiono kształt odpowiedzi atrapy wymagany przez SDK, odjęcie historii z wiadomości `developer` w asercji oraz element tekstu opinii odczytywany przez testy przeglądarkowe. Powtórzenie E2E ujawniło też przedwczesne odświeżenie w teście dwóch błędów. Test czeka teraz na drugie żądanie i widoczny błąd. Ponowne sprawdzenia dały powyższe wyniki.

## Odbiór konkursowy

Lokalne demo było gotowe do próby prezentacji. Na etapie implementacji uogólnienie Luny z promptem 1.2.0 miało status **NOT RUN**. W poprzednim pomiarze live wszystkie trzy loty M04 były poprawne, ale model dostał w regule przykład `(x-2)` i za każdym razem zaproponował ten sam wielomian. Etap sprawdzeń bezpłatnych wykorzystał **0 wywołań OpenAI**.

1. Po odrębnej zgodzie przeprowadzić małe live na translacji −4 i przebudowanej geometrii. Limit **8 żądań**, po cztery warunki A/B/C/D, jedna tura transferu na warunek, GPT-6 Luna `xhigh`, bez ponowień. Ocenić współrzędne w uzasadnieniu i porównać A z D. [Komenda i rubryka](../docs/17-odbior-live.md#uogólnienie-m04-na-czterech-geometriach-testowych).
2. Bieżący Windows CI, uruchomienie EXE na osobnym Windows i publiczny HTTPS mają status **NOT RUN**. Na zatwierdzonym hoście wykonać próbę limitu zero i dostępu z innego urządzenia, a następnie odbiór autoryzowanych tur. [Windows](../docs/16-windows-odbior.md) · [HTTPS](../docs/17-odbior-live.md#jedna-instancja-za-https).
3. Pilotaż 3–5 osób, aktualny film i zgłoszenie mają status **NOT RUN**. Gotowy opis PDF i scenopis nie zastępują nagrania, testu na docelowym sprzęcie i podpisanych formularzy. [Scenopis](../docs/18-film-konkursowy.md) · [Checklista](../release/CHECKLISTA.md). Organizator wskazuje 29 listopada 2026, maksymalnie 5 minut filmu i jedną stronę opisu. [Wydział Informatyki UwB](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas).
