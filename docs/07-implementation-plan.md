# Plan implementacji dla Codex i autora

## Zasada prowadzenia prac
Pracuj kolejno po pionowych fragmentach funkcjonalności. Każdy etap kończy się sprawdzalnym rezultatem. Nie wystarczy ekran makiety z przyciskiem „AI”, który zawsze odtwarza jedną odpowiedź. Aktualizuj IMPLEMENTATION_STATUS.md: wykonane elementy, polecenia i wyniki weryfikacji, blokery, następne zadanie.

Ta paczka jest zleceniem pełnej implementacji. Nie trzeba ponownie prosić o zatwierdzenie kolorów, nazw komponentów lub zwykłych zależności. Potrzebne dane zewnętrzne, np. klucz API, odnotuj bez wypisywania sekretów; pozostałą część wykonuj dalej.

## Etapy
### E0. Uruchamialny szkielet
- Sprawdź istniejące pliki i instrukcje repozytorium; zachowaj pracę użytkownika.
- Utwórz npm workspaces, TypeScript strict, React/Vite, Express i wspólne pakiety.
- Dobierz kompatybilne wersje, przypnij je lockfile.
- Wczytaj JSON Schema i wszystkie misje.
- Dodaj .gitignore, .env.example, README z komendami.
**Odbiór:** po instalacji uruchamia się aplikacja z listą sześciu misji; brak klucza daje jasno oznaczone demo.

### E1. Matematyka i jedna plansza
- Zaimplementuj bezpieczny parser i kanonizację.
- Zaimplementuj ograniczenia rodzin i współczynników.
- Zaimplementuj analityczne kolizje, bramki, granice świata i zdarzenie zatrzymania.
- Przenieś przypadki referencyjne Python do testów TS.
- Narysuj jedną practice z M01, pole wzoru i przejazd.
**Odbiór:** wszystkie rozwiązania referencyjne przechodzą w silniku TS, znane błędy nie przechodzą, cienka przeszkoda nie jest pomijana.

### E2. Jedna kompletna misja
- Dokończ practice → teach → robot_transfer → human_check dla M01.
- Dodaj dwie prognozy liczbowe w teach, dziennik zasad i zapis postępu.
- Zaimplementuj jawny demo provider i jego etykiety.
- Ukryj przed pierwszym human_check podgląd toru, obliczenia y i dziennik reguł.
- Pierwszą próbę zapisz niezmiennie; późniejsze postępy oddziel.
**Odbiór:** nowy użytkownik przechodzi M01 bez podpowiedzi autora; robot może przegrać i nie blokuje sprawdzianu.

### E3. Prawdziwe AI
- Dodaj anonimową sesję, walidację DTO, recompute faktów i role faz.
- Dodaj adapter Responses API, ścisły schemat i ograniczenia kontekstu.
- Obsłuż refusal, incomplete, błędny JSON, timeout, limit, stare odpowiedzi i błędny wzór.
- Dodaj trwały globalny limit wywołań i jawne przejście do demo.
- Uruchom evale deterministyczne; testy live dopiero z kluczem.
**Odbiór:** co najmniej M01 i M04 działają live, reakcja odnosi się do wyjaśnienia, a propozycja jest sprawdzana przez engine. Wyniki testu zapisane, nie zmyślone.

### E4. Cała kampania
- Wczytaj pozostałe misje przez wspólne komponenty, bez osobnych hardcodowanych ekranów.
- Dodaj statyczne wskazówki practice zgodne z umiejętnością.
- Sprawdź komplet 24 scen i pełną ścieżkę 6 misji.
- Dokończ ekran postępu, reset i wznowienie.
**Odbiór:** pełna kampania w demo, pokryte wszystkie rodziny umiejętności w live, brak rozwiązań human_check w bundle/model context.

### E5. UX i test z ludźmi
- Dopracuj etykiety, czytelność wzoru, skale, klawiaturę, focus i reduced-motion.
- Sprawdź 1366×768, 1440×900 i telefon 390×844.
- Przeprowadź krótkie próby użycia z 3–5 osobami, jeśli autor ma taką możliwość.
- Popraw największe trudności, bez dodawania nowych trybów.
**Odbiór:** użytkownik rozumie cel, sam uruchamia przejazd i odróżnia swój wynik od wyniku robota. Nie przedstawiać małego pilota jako badania skuteczności nauczania.

### E6. Wydanie konkursowe
- Spakuj Electron i sprawdź uruchomienie na czystym Windows.
- Przygotuj instrukcje kompilacji, uruchomienia i użytkowania.
- Przygotuj folder release z checklistą, raportem i szablonem opisu.
- Skonfiguruj prawdziwy endpoint dla jury albo jawnie oznacz brak tej gotowości.
- Nagraj prawdziwy przebieg aplikacji i zamontuj film ≤5 minut.
**Odbiór:** każdy element checklisty konkursowej ma plik lub jawny blocker.

## Harmonogram propozycji na listopad 2026
To wariant intensywny dla osoby korzystającej z Codex, nie gwarancja terminu. Termin zgłoszeń wskazany na stronie konkursu: 29 listopada 2026. Sprawdź ponownie przed wysyłką.

| Okres | Rezultat |
|---|---|
| 3–5 XI | E0 i E1: działa silnik, widoczna jedna plansza |
| 6–9 XI | E2: kompletna misja M01 w demo |
| 10–14 XI | E3: rzeczywiste AI i błędy integracji |
| 15–18 XI | E4: cała kampania |
| 19–22 XI | E5: użyteczność, poprawki, pierwsza paczka Windows |
| 23–25 XI | E6: test dystrybucji, instrukcje, nagranie |
| 26–27 XI | Kontrola linków, komplet dokumentów i wysyłka z zapasem |
| 28–29 XI | Bufor na błędy lub brakujące formalności |

## Gdy czasu zabraknie
W pierwszej kolejności usuń ozdobne animacje, dźwięk, rozbudowane statystyki, eksport postępu i dodatkowe wskazówki. Zachowaj matematyczną poprawność, prawdziwe AI, jasne etykiety i sprawdzian własny.

Zmniejszenie liczby misji poniżej sześciu to zmiana zakresu wymagająca świadomej decyzji autora. Nie ogłaszaj ukończenia sześciu misji, jeżeli część jest tylko kartami menu. Nie poświęcaj instrukcji i działającej paczki na rzecz kolejnej funkcji.

## Tryb pracy w kolejnych sesjach Codex
Po zmianie sesji:
1. Przeczytaj AGENTS.md i IMPLEMENTATION_STATUS.md.
2. Sprawdź faktyczny stan kodu i ostatni raport, a nie samo zaznaczenie checkboxów.
3. Dokończ bieżący etap, potem przejdź do następnego.
4. Nie wykonuj ponownie płatnych testów, jeśli nie zmienił się adapter/prompt/model albo nie pozostało konkretne ryzyko.
5. W podsumowaniu podaj: co działa, co sprawdzono, co wymaga konfiguracji autora.
