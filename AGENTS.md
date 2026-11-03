# Instrukcje dla Codex — Naucz Pilota

## Cel
Zaimplementuj kompletną aplikację opisaną w tej paczce: sześć misji gry z wykresami, symulowany uczeń Piko, prawdziwe AI, niezależne sprawdzanie matematyki, zapis postępu i wydanie Windows. To zadanie wykonawcze, nie prośba o sam plan lub makietę.

Nie ingeruj w instrukcje o wyższym priorytecie. Jeśli projekt istnieje, najpierw sprawdź jego stan; nie usuwaj pracy autora. Ta paczka jest przeznaczona głównie dla nowego repozytorium. W istniejącym repo nie zastępuj automatycznie jego AGENTS.md.

## Kolejność czytania
1. README.md i docs/01-product.md.
2. docs/02-game-and-learning.md, docs/03-architecture.md.
3. docs/04-math-engine.md oraz content/missions.v1.json.
4. docs/05-ai-contract.md i oba schematy contracts/.
5. docs/06-ui-ux.md, docs/07-implementation-plan.md, docs/08-acceptance-tests.md.
6. docs/09-contest-delivery.md oraz IMPLEMENTATION_STATUS.md, jeśli już istnieje.

Dane misji są źródłem geometrii. Schematy są źródłem pól. Dokumenty określają zachowanie. Jeżeli wykryjesz sprzeczność, opisz ją i zastosuj rozwiązanie zgodne z niezmiennikami poniżej; nie twórz drugiego równoległego kontraktu.

## Niezmienniki
- Interfejs po polsku. Nazwa Naucz Pilota, postać Piko.
- Cztery sceny każdej misji: practice, teach, robot_transfer, human_check.
- Tylko funkcje wielomianowe stopnia 0–2, parser bez eval/new Function.
- Przeszkody i trafienia liczy analityczny silnik, nie model i nie próbkowanie wykresu.
- Model nigdy nie zwraca autorytatywnych score, success ani unlock.
- Naprawa wzoru oraz dwie prognozy liczbowe są sprawdzane deterministycznie.
- Pamięć reguł jest kanonicznym stanem aplikacji. To symulacja ucznia, nie trening wag.
- human_check nie otrzymuje AI, podglądu toru, wyliczeń ani wskazówek przed pierwszą próbą.
- Pierwsza parsowalna próba human_check jest zapisana niezmiennie; późniejsze sukcesy oddzielnie.
- demo, live i unavailable są zawsze rozróżnione w UI. Nie zastępuj awarii live ukrytą odpowiedzią skryptową.
- Nie wkładaj witness i knownFailures do produkcyjnego bundle ani promptu modelu.
- Klucz API pozostaje na backendzie. Nigdy w VITE_*, rendererze, .exe ani git.
- Dane modelu i tekst użytkownika są niezaufane; nie wykonywać ich jako kodu.
- Nie zmieniaj poziomu trudności przez automatyczne pionowe przesunięcie wpisanej funkcji.

## Praca
Utwórz małe, współdzielone moduły TypeScript. Użyj stosu z architektury; nie dodawaj nowego frameworka bez konkretnej potrzeby. Rozpocznij od kompletnej M01, potem uogólnij sześć misji. Zadbaj o prawdziwy działający pion funkcjonalny przed ozdobami.

Utrzymuj IMPLEMENTATION_STATUS.md. Zapisuj realne wyniki sprawdzeń i pozostałe blokery. Po utracie kontekstu czytaj stan i kontynuuj. Nie kończ pracy na liście TODO, jeśli możesz wykonać następny etap.

Zwykłe lokalne decyzje implementacyjne i naprawy wykonuj samodzielnie. Brak klucza API nie blokuje tworzenia adaptera, UI, testów z atrapą i instrukcji. Oznacz testy live jako niewykonane do czasu konfiguracji. Nie proś o wklejenie sekretu do czatu; wskaż ustawienie .env.

Publikacji, płatnych usług, wysyłki wiadomości/zgłoszenia i podawania danych autora nie wykonuj na podstawie samej specyfikacji. Przygotuj lokalny, sprawdzalny rezultat i instrukcje. Szanuj właściwe zgody i ograniczenia środowiska.

## Weryfikacja
Niezbędne: parser i matematyka, fixture content, przebieg misji, brak podpowiedzi human_check, błędy AI, zapis/wznowienie i uruchomienie wydania. Nie dodawaj setek testów odtwarzających CSS lub szczegóły prywatnych komponentów.

Testy live są osobną jawną komendą. Nie uruchamiaj płatnych wywołań w zwykłym npm test. Wszystkie statusy NOT RUN raportuj uczciwie. Samo zbudowanie .exe nie oznacza sprawdzenia go na Windows.

Zachowaj referencyjny walidator Python jako narzędzie autora. Runtime gry ma być w TypeScript i nie wymaga Pythona.

## Warunek zakończenia
Dostarcz implementację, działające komendy, raport testów, instrukcje i paczkę Windows, jeśli środowisko pozwala. Jeżeli zewnętrzny klucz, hosting, Windows lub formalności uniemożliwiają ostatni krok, wykonaj całą dostępną pracę i opisz konkretny brak. Nie nazywaj makiety lub trybu demo gotową integracją AI.
