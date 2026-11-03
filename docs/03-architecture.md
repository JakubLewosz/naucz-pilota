# Architektura i kontrakty między częściami

## Wybrany stos
- React + TypeScript + Vite: jeden interfejs webowy.
- SVG i requestAnimationFrame: siatka, wykres, bramki, przeszkody i animacja Piko.
- Node.js + Express + TypeScript: mały serwer pośredniczący do modelu.
- Oficjalny SDK OpenAI, Responses API i Structured Outputs: pierwszy adapter modelu.
- Electron: cienkie opakowanie desktopowe z lokalnie spakowanym interfejsem.
- npm workspaces, Vitest, Playwright; walidacja JSON Schema przez Ajv.
- electron-builder: paczka Windows, ze sprawdzeniem aktualnej dokumentacji podczas implementacji.
- SQLite w jednej instancji backendu: trwały licznik limitów i mała pamięć sesji z TTL; bez bazy kont.

To decyzje projektowe, a nie wymóg konkursu. Wybierz aktualne, wzajemnie kompatybilne stabilne wydania, sprawdź wymagania Node w dokumentacji i zapisz wersje w lockfile. Nie używaj zależności z tagiem latest w odtwarzalnych instrukcjach ani nie wymyślaj numerów wersji.

## Struktura po implementacji
    apps/
      web/             React, SVG, reducer, lokalny zapis
      server/          API, sesja, adapter modelu, limity
      desktop/         Electron main + wąski preload
    packages/
      core/            parser, wielomiany, kolizje, ocena sceny
      content/         walidacja i kompilacja danych misji
      contracts/       typy, walidatory request/response, błędy
    content/           źródłowe misje, reguły i przypadki AI z tej paczki
    contracts/         źródłowe JSON Schema z tej paczki
    docs/              specyfikacja oraz późniejsze instrukcje użytkownika
    tools/             walidator referencyjny i skrypty materiałów
    tests/             integracja, E2E, scenariusze live
    release/           wygenerowane paczki do przekazania, bez sekretów

Pliki z tej paczki są specyfikacją i danymi. Nie usuwaj ich przy scaffoldingu. Po implementacji uzupełnij README o faktycznie działające komendy; zachowaj decyzje projektowe.

## Wspólny silnik
packages/core nie zależy od React, DOM, sieci ani dostawcy AI. Eksportuje co najmniej:
- parseExpression(input) → AST i znormalizowane współczynniki lub kontrolowany błąd.
- evaluatePolynomial(coefficients, x) → y.
- polynomialRange(coefficients, xMin, xMax) → min/max i miejsca ekstremów.
- evaluateScene(scene, expression) → wynik, fakty, pierwsze zdarzenie fizyczne.
- verifyNumericEvidence(scene, expression, evidence) → sprawdzone prognozy.
- deriveRuleEvidence(mission, repair, evidence) → kanoniczny wpis pamięci.
- buildSceneFacts(scene, expression) → lista faktów ze stabilnymi identyfikatorami.

Frontend używa silnika do natychmiastowej rozgrywki. Backend ponownie liczy dane potrzebne modelowi. Ani klientowy tekst „passed”, ani odpowiedź modelu nie stanowią dowodu poprawności.

Wynik silnika powinien rozdzielać: ok, primaryCode, diagnostics[], checkpoints[], firstPhysicalEvent oraz canonicalPolynomial. Szczegółowe priorytety i tolerancje są w 04-math-engine.md. Nie utożsamiać głównego komunikatu błędu z czasem pierwszego uderzenia.

## Dane publiczne i dane autora
Źródłowe misje zawierają witness i knownFailures do testów. Skrypt build:content tworzy:
1. public-missions.json: geometria, teksty, dozwolone rodziny, ograniczenia, początkowe wzory.
2. authoring-missions.json: pełny zestaw do testów i narzędzi autora.

Z produkcyjnego bundla i source map wyklucz witness, knownFailures i wzory odpowiedzi human_check. To chroni normalny przebieg nauki, nie jest zabezpieczeniem przed świadomym analizowaniem otwartego kodu. Backend modelu również nie wkłada rozwiązań referencyjnych do promptu.

Dane statycznego trybu demo mogą zawierać własne jawne propozycje robota dla robot_transfer. Nie wolno wykorzystywać ich jako ukrytego zastępstwa odpowiedzi live.

## Stan gry
Główny stan prowadzi reducer lub niewielka jawna maszyna stanów, nie zbiór niespójnych useState.

Minimalne obszary:
- contentVersion, saveVersion, sessionRevision (serwera) i viewRevision (lokalne UI).
- activeMissionId i sceneRole.
- interactionState: ready, checking, animating, feedback, awaiting_ai, awaiting_prediction, ai_unavailable, completed. Nazwy i zdarzenia są wspólne z 02-game-and-learning.md; phase w DTO AI oznacza osobno teach_explain, teach_repair lub robot_propose.
- attempt records: expression, canonicalPolynomial, engineResult, attemptIndex, hintCount, timestamp, sceneId.
- teach evidence: własne wyjaśnienie, naprawiony wzór, dwie prognozy, potwierdzony ruleId.
- rule journal: ruleId, numericEvidence, practice status, first independent result.
- firstHumanCheckAttempt: jeden niezmienny zapis pierwszego parsowalnego uruchomienia.
- ai mode, request in-flight, turnId i provider error.
- settings: reducedMotion, sound=false domyślnie, font scale.

sessionRevision jest rewizją serwera: backend zwiększa ją raz po przyjęciu nowej tury, a klient przejmuje wartość z odpowiedzi. Zmiana sceny, reset i edycja istotna dla oczekującej odpowiedzi zwiększają oddzielne lokalne viewRevision. Wynik stosuje się do widoku tylko przy zgodnym activeTurnId, sceneId i viewRevision zachowanym przy wysłaniu. AbortController anuluje żądanie; lokalna rewizja zabezpiecza też przed wynikiem mimo anulowania. Nie zwiększaj sessionRevision przy każdym wpisanym znaku.

## Zapis lokalny
Wersjonowany JSON w localStorage: ustawienia, postęp, próby, dowody reguł. Limitować liczbę pełnych prób, np. ostatnie 20 na scenę, zachowując zawsze pierwszą próbę human_check i podsumowania. Nie zapisywać kluczy ani tokenów API.

Dialog w domyślnym zapisie obejmuje tylko krótką bieżącą historię do wznowienia; umożliwić „Wyczyść rozmowę” bez kasowania wiedzy oraz „Usuń cały postęp”. W trybie live wysyłać tylko niezbędny fragment bieżącej rozmowy i dowody, nie cały localStorage.

Przy nieznanym saveVersion: nie nadpisywać oryginału; zachować kopię i zaproponować rozpoczęcie nowego zapisu. Uszkodzony zapis ma prowadzić do czytelnego ekranu odzyskania, nie pustej strony.

## Warstwa AI i transport
Interfejs adaptera w kliencie:
- getStatus() → mode i dostępność.
- startSession() → nieprzezroczysty identyfikator sesji.
- sendLearnerTurn(request, signal) → typowany wynik aplikacji.

W przeglądarce użyj relative URL /api i same-origin. W dev Vite proxy przekazuje /api do Express. W produkcji jedna domena serwuje frontend i API.

Backend:
- GET /api/health: gotowość aplikacji i tryb, bez klucza, pełnych błędów dostawcy ani sekretów.
- POST /api/session: anonimowa sesja, losowy identyfikator i uprawnienie do jej użycia; przy ważnym cookie/tokenie zwraca istniejącą sesję z aktualną sessionRevision, służąc także synchronizacji po przerwanym żądaniu.
- POST /api/learner-turn: DTO dokładnie z contracts/ai-request.schema.json.
- Żądania dialogu mogą przesłać ruleEvidence, które backend przelicza dla odtworzenia kanonicznej pamięci.

Web używa krótkotrwałego HttpOnly cookie z SameSite i Secure w produkcji. Dla desktopu serwer zwraca krótkotrwały token sesji transportowej; przechowuje go tylko main process. sessionId w JSON identyfikuje sesję i sam nie jest sekretem autoryzacji. Anonimowe sesje nie zastępują globalnego limitu wykorzystania.

Schemat odpowiedzi modelu w ai-response.schema.json nie jest całym HTTP response. Serwer dodaje osobną kopertę z trybem, identyfikatorami, wynikiem walidacji wzoru i błędem. Rozdzielenie jest szczegółowo opisane w 05-ai-contract.md.

## Tryby
| Tryb | Zachowanie |
|---|---|
| demo | Odtwarzalny symulator ucznia, bez płatnych wywołań; widoczne „Tryb demonstracyjny — bez połączenia z AI” |
| live | Faktyczne żądania do skonfigurowanego modelu; nazwa dostawcy/modelu w informacjach technicznych |
| unavailable | Informacja o błędzie, zachowany postęp, ponów lub jawnie przejdź do demo |

Brak klucza przy pierwszym uruchomieniu może wybrać demo. Błąd istniejącego live nigdy nie zmienia automatycznie trybu na demo. Przejście do demo po błędzie wymaga kliknięcia użytkownika i widocznej etykiety. Przy pierwszym użyciu AI pokaż krótką informację o wysyłaniu tekstu do dostawcy.

DemoLearnerAdapter działa lokalnie, bez /api/session, internetu i uruchomionego Express. Ma własny lokalny identyfikator sesji i korzysta z tych samych core/contracts. To obowiązkowa droga offline w desktopie i development bez klucza. Endpoint requestedMode=demo może istnieć do testów kontraktu, ale UI nie może potrzebować serwera do demonstracji. Przełączenie z live na demo tworzy oddzielny kontekst transportowy, zachowując postęp i jawnie zapisując źródło każdej odpowiedzi.

## Desktop i dostawa jury
Electron ładuje lokalnie spakowane zasoby przez własny protokół app://. Nie ładuje zewnętrznej strony jako aplikacji. Renderer: nodeIntegration=false, contextIsolation=true, sandbox=true, restrykcyjne CSP.

Preload udostępnia tylko getAiStatus, startAiSession, sendLearnerTurn oraz ewentualny eksport lokalnego podsumowania. Bez dowolnego fetch, wykonywania komend, ścieżek systemowych czy zapisu wskazanego przez renderer. Main process waliduje DTO, nadawcę IPC i adres serwera.

W trybie live main process łączy się z zaufanym HTTPS backendem z konfiguracji dystrybucji. Wyjątek http://127.0.0.1 dozwolony tylko w developerskim uruchomieniu. Dowolne przekierowania, nawigacje i nowe okna są blokowane. Klucz OpenAI pozostaje wyłącznie na backendzie; spakowanie klucza do .exe nie jest ochroną.

Przygotować dwa warianty uruchomienia:
1. Dla autora: kod + lokalny backend z .env, uruchomiony poleceniem npm run dev.
2. Dla jury: Windows .exe z działającym, wcześniej przygotowanym endpointem live; w razie braku sieci jawne demo.

Utworzenie konfiguracji wdrożenia i dokumentacji jest częścią implementacji. Publikacja do zewnętrznego hostingu, zakup domeny, opłaty i wysłanie zgłoszenia wymagają osobnej decyzji właściciela. Codex może przygotować wszystko lokalnie bez udawania, że backend już został opublikowany.

## Limity i logi
Proponowane wartości domyślne dla małego pilota, do zmiany w konfiguracji:
- wiadomość użytkownika: 600 znaków; body: 16 KiB.
- 6 tur na minutę na sesję; dodatkowy limit IP i trwały limit globalny.
- najwyżej 2 żądania dostawcy na jedną turę, w tym maksymalnie 1 naprawa struktury.
- wspólny budżet czasu tury: 15 sekund; nie 15 sekund na każdą z wielu prób.
- output do 1200 tokenów; model może wymagać większego limitu, co należy sprawdzić na wybranym adapterze.
- dzienny globalny limit 200 żądań dostawcy, liczony także dla napraw i błędów wysłanych do API.

Licznik globalny przechowywać trwale i aktualizować transakcyjnie. Konfiguracja pojedynczej instancji z SQLite wymaga trwałego wolumenu; nie wdrażać jej jako wielu niezależnych instancji z osobnymi licznikami. Koszt w walucie zależy od modelu i użycia; nie obiecywać, że limit liczby wywołań jest twardym limitem finansowym.

Log domyślny: turnId, missionId, model, duration, token usage jeśli dostępne, status i kod błędu. Bez pełnego tekstu rozmowy, sekretów, IP w plikach raportów czy danych ucznia. Retencję operacyjnych danych sesji ograniczyć, np. TTL 24h. Nie dodawać zewnętrznej analityki.

## Wymagane komendy po implementacji
    npm ci
    npm run dev
    npm run typecheck
    npm run lint
    npm run test
    npm run test:content
    npm run test:e2e
    npm run test:ai:live
    npm run build
    npm run desktop:dev
    npm run desktop:dist
    npm run release:check

Komendy należy faktycznie dodać. W obecnej paczce jeszcze nie istnieje package.json. test:ai:live ma wymagać jawnego uruchomienia i skonfigurowanego klucza; nie powinien konsumować API podczas zwykłego npm test.
