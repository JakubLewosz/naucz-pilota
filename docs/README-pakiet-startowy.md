# Naucz Pilota — pakiet startowy dla Codex

**Gra edukacyjna z wykresami funkcji, w której gracz uczy robota Piko, a następnie sam rozwiązuje nowe zadanie.**

Wersja paczki: 1.0, 2026-11-03. To kompletny projekt wykonawczy, dane plansz i materiał testowy do zbudowania aplikacji. **Nie jest to jeszcze działająca aplikacja ani gotowy plik .exe.**

## Jak zacząć
1. Rozpakuj całą paczkę.
2. Użyj katalogu naucz-pilota-codex jako nowego folderu projektu. Otwórz go w używanym środowisku Codex z dostępem do plików i terminala.
3. Wklej pełną treść START_CODEX.md jako pierwsze zadanie.
4. Pozwól Codexowi czytać pliki i realizować etapy E0–E6. Nie trzeba wklejać wszystkich dokumentów osobno do czatu.
5. Gdy będzie potrzebne prawdziwe AI, ustaw klucz i model w lokalnym .env według instrukcji stworzonej przez Codex. Nie wklejaj klucza do rozmowy ani do kodu frontendu.
6. Odbieraj kolejne etapy według docs/08-acceptance-tests.md.

Jeśli pracujesz w istniejącym repozytorium, skopiuj dokumenty i dane do uzgodnionych miejsc, zachowaj dotychczasowy kod oraz istniejące AGENTS.md. Nie nadpisuj instrukcji projektu bez sprawdzenia. Najmniej konfliktów da nowe repo.

Do szybkiego przeczytania koncepcji służy SCHEMAT_PROJEKTU.md. Do ponownego uruchomienia prac w nowej sesji użyj krótkiego polecenia:

> Przeczytaj AGENTS.md i IMPLEMENTATION_STATUS.md, sprawdź faktyczny kod, a następnie kontynuuj od pierwszego nieukończonego etapu. Zachowaj wszystkie niezmienniki i nie raportuj testów, których nie wykonałeś.

## Co jest w paczce
| Plik lub katalog | Zawartość |
|---|---|
| SCHEMAT_PROJEKTU.md | Cały pomysł w jednym dokumencie, dla autora |
| START_CODEX.md | Gotowy prompt zlecający pełną implementację |
| AGENTS.md | Trwałe instrukcje projektu i warunki, których nie wolno zgubić |
| IMPLEMENTATION_STATUS.md | Początkowy stan prac do dalszego aktualizowania |
| docs/01-product.md | Cel, odbiorca, zakres i wyróżnik |
| docs/02-game-and-learning.md | Cztery etapy misji, postęp i sprawdzanie wiedzy |
| docs/03-architecture.md | Stos, struktura repo, stan, transport i wydanie |
| docs/04-math-engine.md | Parser, algebra, geometria, bramki i kolizje |
| docs/05-ai-contract.md | System prompt, pamięć, API, błędy i limity |
| docs/06-ui-ux.md | Widoki, kolory, mikrocopy, klawiatura i scenariusz filmu |
| docs/07-implementation-plan.md | Kolejność budowy i proponowany harmonogram |
| docs/08-acceptance-tests.md | Kryteria odbioru aplikacji |
| docs/09-contest-delivery.md | Pakiet zgłoszeniowy i podział zadań |
| docs/10-sources-and-decisions.md | Źródła i wyraźnie oznaczone decyzje projektowe |
| content/missions.v1.json | 6 misji × 4 sceny; rzeczywista geometria i rozwiązania kontrolne |
| content/missions.schema.json | Schemat treści misji |
| content/skills.v1.json | Umiejętności, reguły i kryteria dowodów liczbowych |
| content/hints.v1.json | 18 stopniowanych wskazówek do ćwiczeń |
| content/ai-evals.v1.json | 42 zaplanowane scenariusze weryfikacji AI i kontraktu |
| contracts/ | Schemat requestu aplikacji i odpowiedzi modelu |
| tools/ | Narzędzia sprawdzające materiały projektowe |
| checks/ | Raporty faktycznie wykonanych kontroli paczki |
| .env.example | Przykład konfiguracji bez sekretów |

## Co sprawdzono już w materiałach
Walidator danych uruchomiono na wszystkich scenach:
- 6 misji i 24 odrębne sceny;
- 24 poprawne rozwiązania kontrolne;
- 37 przykładów odrzucanych z oczekiwanym błędem;
- 42 kontrole parsera i geometrii;
- zgodność tekstów równań ze współczynnikami;
- osobne plansze i wzory dla transferu robota oraz sprawdzianu gracza.

Pełne raporty są w checks/. Liczby dotyczą **materiałów projektowych i referencyjnego walidatora**, nie przyszłej implementacji TypeScript. Przypadki AI są planem testów; nie uruchomiono ich na gotowej aplikacji ani prawdziwym modelu.

## Jak samodzielnie sprawdzić dane teraz
Wymagany Python 3.10 lub nowszy, bez zewnętrznych pakietów:

    python3 tools/validate_missions.py
    python3 tools/validate_missions.py --json-report checks/math-validation.json

Na Windows może być potrzebne polecenie python zamiast python3.

Nie uruchamiaj npm install w tej paczce przed scaffoldem Codex: package.json jeszcze nie istnieje. Komendy npm opisane w architekturze są wymaganiami dla gotowej implementacji.

## Ważne decyzje
- Piko jest symulowanym uczniem. Pamięć to reguły aplikacji i kontekst modelu.
- Sukces matematyczny oblicza silnik, a nie odpowiedź AI.
- Po próbie robota gracz ma nowe zadanie bez podpowiedzi.
- Demo jest jawnie oznaczone i działa lokalnie; live wymaga rzeczywistego modelu.
- Porażka modelu nie jest podmieniana gotowym rozwiązaniem.
- Zakres to sześć dopracowanych misji; nie dodajemy kont, rankingów i multiplayera.

## Gotowość konkursowa
Termin na stronie organizatora w chwili przygotowania: 29 listopada 2026. Szczegóły i link do aktualnego regulaminu są w docs/09-contest-delivery.md.

Codex ma przygotować kod, testy, instrukcje i wydanie. Autor zapewnia konfigurację modelu/hostingu, sprawdzenie Windows, rzeczywiste nagranie, podpisy i wysłanie materiałów. Paczka startowa nie oznacza, że te kroki już wykonano.
