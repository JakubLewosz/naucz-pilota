# Mechanika gry i sprawdzanie zrozumienia

Status: wiążący projekt MVP. Ten dokument opisuje zachowanie aplikacji, a nie wyniki badania edukacyjnego. Dokładne wzory, geometria i identyfikatory plansz pochodzą z `content/missions.v1.json`; kontrakt obliczeń jest w `04-math-engine.md`, a kontrakt rozmowy w `05-ai-contract.md`.

## 1. Obietnica dla gracza

**Napisz funkcję, wyznacz bezpieczny tor i naucz Piko, dlaczego działa. Potem sprawdźcie się osobno na nowych planszach.**

Piko jest symulowanym początkującym pilotem. Celowo zaczyna z typowym błędem dotyczącym funkcji. Gracz jest jego nauczycielem: najpierw sam eksperymentuje, później tłumaczy i poprawia rozwiązanie. Model językowy prowadzi krótką rozmowę oraz proponuje rozwiązanie nowej planszy na podstawie zapisanych zasad. Silnik matematyczny sprawdza wszystkie loty.

Nie przedstawiać rozmowy jako trenowania wag modelu. W ekranie „Jak działa Piko?” użyć wyjaśnienia: „Piko odgrywa ucznia. Zapamiętuje w tej grze zatwierdzone zasady i korzysta z nich w kolejnych rozmowach. Nie zmieniamy wag modelu AI”.

Zabawa ma opierać się na przewidywaniu i oglądaniu lotu, a nie na długim czacie. Rozmowy mają być krótkie; jedna wypowiedź robota nie może zasłaniać planszy. Bez punktów za szybkość, długość tekstu lub zgodność opinii z AI.

## 2. Jedna misja, cztery odrębne plansze

Każda misja ma cztery sceny. Ich geometria pochodzi z pliku treści; nie kopiować jednej planszy cztery razy ze zmienionym nagłówkiem.

| Etap i identyfikator | Co robi gracz | Co robi Piko | Warunek ukończenia etapu |
|---|---|---|---|
| 1. „Sprawdź tor” — `practice` | Układa wzór, obserwuje neutralny podgląd, uruchamia lot; może otworzyć stopniowane wskazówki | Tylko przedstawia krótkie zadanie; nie prowadzi rozmowy z modelem | Silnik zaakceptował funkcję i cały lot |
| 2. „Naucz Piko” — `teach` | Naprawia błędny wzór, podaje dwie prognozy liczbowe i własnymi słowami wyjaśnia zmianę | Pokazuje zaprojektowane nieporozumienie, dopytuje i opisuje swoim językiem to, co zrozumiał | Poprawny lot, zaliczone prognozy G1/G2, próba wyjaśnienia tekstowego i świadome zatwierdzenie reguły kanonicznej |
| 3. „Lot Piko” — `robot_transfer` | Najpierw przewiduje, czy propozycja robota zadziała, następnie ogląda wynik i porównuje przewidywanie z obliczeniem | Proponuje wzór na nową planszę, korzystając z zatwierdzonych zasad | Oceniono jedną propozycję albo pokazano jawnie brak użytecznej propozycji; wynik robota nie blokuje kolejnego etapu |
| 4. „Twój samodzielny lot” — `human_check` | Rozwiązuje inną nową planszę bez AI i wskazówek; przed pierwszym lotem nie widzi podglądu toru | Milczy; nie otrzymuje tej planszy w kontekście | Co najmniej jeden poprawny samodzielny lot; wynik pierwszej próby zostaje zachowany osobno |

Gra nie dowodzi zrozumienia na podstawie tego, że Piko rozwiązał zadanie. Wynik gracza na ostatniej planszy jest oddzielnym dowodem wykonania konkretnego zadania. Nie jest automatycznie dowodem trwałej poprawy wyników w matematyce.

### 2.1. `practice`: eksperyment bez przeciążenia

1. Pokaż cel jednym zdaniem, planszę i początkowy wzór.
2. Po zmianie parsowalnego wzoru rysuj neutralny przerywany podgląd. Nie oceniaj trafienia za pomocą kolorów przed przyciskiem „Leć”.
3. „Leć” uruchamia analityczną ocenę i animację odpowiadającą tej ocenie. Animacja jest ilustracją wyniku silnika.
4. Po porażce pokaż konkretny powód i miejsce zdarzenia. Zachowaj edytowalny wzór.
5. Wskazówki są statyczne, przygotowane dla umiejętności. Kolejne odsłonięcia: właściwość funkcji; parametr, na który warto spojrzeć; fragment obliczenia na aktualnym zadaniu. Nie wyświetlać rozwiązania referencyjnego z `witness`.
6. Po sukcesie przycisk „Teraz naucz Piko” przechodzi do innej planszy `teach`.

Nie wysyłaj wywołań modelu przy wpisywaniu wzoru, każdym ruchu myszy, otwieraniu wskazówki lub uruchamianiu lotu gracza.

### 2.2. `teach`: naprawa, dwie prognozy, wyjaśnienie

Początkowa wypowiedź i błędny wzór są elementem scenariusza. Interfejs ma pokazywać je jako „Pomysł Piko”, nie jako wynik eksperymentu dowodzącego, że wybrany model rzeczywiście popełnia ten błąd samodzielnie.

Przykładowa struktura interakcji, bez wpisywania konkretnego rozwiązania do UI:

1. Piko: krótkie zdanie ujawniające typowe nieporozumienie.
2. Przycisk „Sprawdź pomysł Piko” uruchamia jego wzór. Wynik jest obliczony przez silnik.
3. Pole „Twój poprawiony wzór” oraz dwa kompaktowe pola „Dla x = … przewiduję y = …” przy punktach kontrolnych **G1** i **G2**. Wartości x muszą pochodzić z bieżącej sceny.
4. Pole „Co Piko powinien zmienić i dlaczego?”; do 600 znaków. Wystarczy jedno lub dwa zdania. Nie wymagać określonych słów kluczowych ani minimalnej długości poza niepustą treścią po usunięciu białych znaków.
5. „Sprawdź naprawę” przelicza funkcję oraz prognozy zgodnie z kontraktem `numericEvidence`. Tolerancja i sposób porównania są wspólne z backendem, bez osobnej, łagodniejszej reguły w UI.
6. „Powiedz Piko” wysyła świadomie rozpoczętą turę AI z aktualnym wzorem, wyjaśnieniem i dowodami liczbowymi. Nie wysyłać tekstu automatycznie.
7. Piko odpowiada krótko. Może dopytać, ale **jego ocena tekstu nie odblokowuje ani nie blokuje etapu**.
8. Gdy warunki numeryczne są spełnione, pokaż regułę kanoniczną z treści misji i przycisk „Zapisz tę zasadę dla Piko”. Dopiero potwierdzenie zapisuje regułę w dzienniku.

W normalnym flow zachęcać do najwyżej dwóch krótkich wymian: wyjaśnienie, ewentualne doprecyzowanie. Jeśli gracz chce pisać dalej, obowiązują limity z kontraktu API, ale rozbudowana rozmowa nie daje dodatkowych nagród. Jeżeli AI błędnie oceni poprawną odpowiedź, interfejs pokazuje „Obliczenie jest poprawne. Odpowiedź Piko może wymagać korekty” i pozwala kontynuować na podstawie faktów.

Zaliczenie prognozy liczbowej nie oznacza automatycznego potwierdzenia każdego zdania w swobodnym wyjaśnieniu. UI ma osobno pokazywać „Tor i prognozy sprawdzone” oraz „Opinia Piko o wyjaśnieniu”.

Mapowanie akcji na API: „Sprawdź naprawę” jest wyłącznie lokalnym obliczeniem. „Powiedz Piko” bez kompletu prognoz używa phase=teach_explain i numericEvidence=[]; po poprawnym locie oraz wpisaniu G1/G2 używa phase=teach_repair z dwoma rekordami. Dopytanie tekstowe bez nowej naprawy wraca do teach_explain. Potwierdzenie karty reguły jest lokalną akcją reducera, nie nową płatną turą. Do kolejnego robot_propose trafiają zatwierdzone learnedRuleIds wraz z ruleEvidence.

### 2.3. `robot_transfer`: prawdziwa propozycja, prawdziwy wynik

Nowa plansza może mieć tę samą rodzinę funkcji i cel dydaktyczny, lecz inne współrzędne i rozwiązanie. Model otrzymuje jedynie dozwolony publiczny opis tej sceny, zatwierdzone reguły i fakty obliczeniowe. Nie otrzymuje `witness`, `knownFailures`, rozwiązania planszy kontrolnej ani kolejnych misji.

1. Pokaż nową planszę i przycisk „Piko, spróbuj sam”.
2. Po odpowiedzi pokaż wzór Piko oraz jego krótkie uzasadnienie. Nie pokazuj od razu toru ani werdyktu silnika.
3. Gracz wybiera „Przeleci”, „Nie przeleci” lub „Jeszcze nie wiem”. Przewidywanie służy refleksji, nie ocenie ani blokadzie.
4. „Sprawdź lot Piko” pokazuje obliczony wynik i animację. Wewnętrzna walidacja odpowiedzi może być wcześniejsza; ukrycie werdyktu w UI ma służyć przewidywaniu, nie bezpieczeństwu danych.
5. Jeżeli wzór jest niepoprawny, pokaż konkretny błąd. Dopuszczalna jest **jedna opcjonalna poprawka robota**, wywołana przez gracza i wykorzystująca wynik silnika jako fakt.
6. Po pierwszym ocenionym locie dostępny jest przycisk „Teraz mój samodzielny lot”. Powodzenie AI nie jest warunkiem kontynuacji.

Nie zastępować nietrafionego wzoru rozwiązaniem referencyjnym. Nie poprawiać po cichu współczynników. Jeżeli model nie poda parsowalnego wzoru nawet po przewidzianej kontraktem naprawie odpowiedzi, pokazać „Piko nie przygotował poprawnego wzoru. Możesz przejść do własnej próby”. Odmowa, niekompletna odpowiedź i awaria połączenia pozostają jawne.

Limit jednej opcjonalnej poprawki **pedagogicznej** jest odrębny od ograniczonej naprawy niepoprawnego formatu JSON wewnątrz jednej tury API. Kod nie może utożsamiać tych dwóch liczników.

### 2.4. `human_check`: niezależna pierwsza próba

To osobna scena, której wcześniej nie rozwiązywał robot. Przed pierwszym zatwierdzeniem widoczne są tylko statyczny układ współrzędnych, obiekty, ograniczenia i pole wzoru. **Nie ma dynamicznej trajektorii, suwaków, automatycznie wyliczanego y, oceny kolizji, wskazówek, panelu rozmowy ani podglądu dziennika reguł.** Informacja o zasadach użycia interfejsu pozostaje dostępna.

Pierwsza próba jest rejestrowana dopiero po naciśnięciu „Sprawdź mój lot” z parsowalnym wyrażeniem. Błąd składni nie konsumuje próby; można go poprawić bez uzyskania matematycznej podpowiedzi. Parsowalna funkcja należąca do niewłaściwej rodziny lub łamiąca ograniczenie współczynników już jest próbą i może dać niepowodzenie.

Po pierwszej próbie wolno pokazać normalny wynik i podgląd trajektorii tej próby. Gracz może poprawiać wzór i ponawiać lot; każda kolejna próba pozostaje odróżniona od pierwszej. Komunikat po późniejszym sukcesie: „Misja ukończona. Udało się w 3. próbie. Pierwsza próba pozostaje w podsumowaniu”. Nie zastępuj pierwszego wyniku najlepszym wynikiem.

Jeżeli gracz wraca do wcześniejszego ćwiczenia lub otwiera reguły przed kolejną próbą, zachowaj wcześniejszą historię i oznacz późniejsze wykonanie jako „po powtórce”. Wersja MVP nie musi automatycznie mierzyć nauki poza aplikacją. Zamknięcie i ponowne otwarcie aplikacji nie resetuje pierwszej próby.

Na tej planszy nie wysyłaj zapytań do AI. Backend odrzuca wywołanie trybu rozmowy dla `human_check`, nawet jeśli spreparowany klient spróbuje je wysłać.

## 3. Sześć misji

Tytuły w UI należy odczytywać z treści misji. Poniższa tabela jest mapą intencji, nie drugim źródłem współrzędnych.

| Misja | Główna umiejętność | Typowe nieporozumienie do pokazania | Co gracz powinien potrafić wyjaśnić |
|---|---|---|---|
| M01 | `line_intercept` | Stała bez x uznana za niemającą wpływu na wysokość wykresu | Jak zmieniają się wartości y całej prostej po zmianie wyrazu wolnego |
| M02 | `line_slope` | Dodatni znak a użyty do uzyskania prostej malejącej | Jak przyrost y zależy od przyrostu x i współczynnika kierunkowego |
| M03 | `quadratic_vertical_shift` | Dodatnia stała uznana za przesunięcie w dół | Jak znak przesunięcia pionowego zmienia wierzchołek i wartości funkcji |
| M04 | `quadratic_horizontal_shift` | Kierunek przesunięcia w wyrażeniu `(x-p)` odczytany odwrotnie | Dlaczego wierzchołek jest przy x = p |
| M05 | `quadratic_curvature` | Większy dodatni współczynnik przy kwadracie utożsamiany z szerszą parabolą | Dlaczego wartości rosną szybciej w tej samej odległości od wierzchołka |
| M06 | `combine_transformations` | Jeden parametr ma „naprawić wszystko” bez sprawdzenia innych warunków | Jak połączyć położenie wierzchołka i krzywiznę, sprawdzając kilka punktów |

Kolejność jest liniowa. Ukończenie M01 odblokowuje M02 itd. Ostatnia misja pokazuje podsumowanie całej gry. Ukończone misje można powtarzać; nowe podejście nie usuwa zapisanej pierwszej próby pierwotnego podejścia. Reset całego lokalnego postępu wymaga jednego jasnego potwierdzenia w ustawieniach.

## 4. Dziennik reguł i dowody postępu

Każda reguła ma stały identyfikator i treść kanoniczną pochodzącą z pliku treści:

| Umiejętność | Reguła |
|---|---|
| `line_intercept` | `RULE_LINE_INTERCEPT` |
| `line_slope` | `RULE_LINE_SLOPE` |
| `quadratic_vertical_shift` | `RULE_QUAD_VERTICAL` |
| `quadratic_horizontal_shift` | `RULE_QUAD_HORIZONTAL` |
| `quadratic_curvature` | `RULE_QUAD_CURVATURE` |
| `combine_transformations` | `RULE_COMBINE` |

Nie nazywać stanu reguły „umiesz” na podstawie samej rozmowy. Dziennik powinien pokazywać osobne, konkretne zdarzenia:

- **Przećwiczona:** gracz zaliczył naprawę i prognozy, a następnie zatwierdził regułę.
- **Piko zastosował / Piko jeszcze nie zastosował:** wynik zweryfikowanej propozycji robota na scenie transferowej. To opis tej próby, nie miara gracza.
- **Samodzielny lot:** sukces albo niepowodzenie pierwszej próby gracza; dodatkowo liczba prób do ukończenia lub informacja „jeszcze nie ukończono”.
- **Po powtórce:** późniejszy sukces nastąpił po powrocie do ćwiczeń lub reguł.

`learnedRuleIds` oznacza listę zatwierdzonych zasad przekazywanych do roli Piko. Nie jest deklaracją, że użytkownik opanował materiał. Serwer sam przelicza dowody potrzebne do użycia reguły w sesji, zgodnie z kontraktem API.

Przechowywać lokalnie tylko dane potrzebne grze: wersję treści, identyfikatory etapów, wzory prób, wyniki silnika, prognozy, użyte wskazówki, tryb odpowiedzi AI i daty zdarzeń. Surowych rozmów nie traktować jako trwałej „wiedzy” robota. Tekst wyjaśnienia służy aktualnej rozmowie; zasady dalszych scen pochodzą z zatwierdzonego katalogu.

## 5. Stany i zdarzenia

Podział musi pozwolić anulować spóźnione odpowiedzi i wznowić aplikację bez podwójnego naliczania prób. W implementacji oddziel `sceneRole`, stan interakcji oraz wynik próby.

| Stan interakcji | Dozwolone główne zdarzenia | Zachowanie |
|---|---|---|
| `ready` | edycja, `SUBMIT_FLIGHT`, `SUBMIT_EXPLANATION`, nawigacja | Formularz aktywny zgodnie z etapem |
| `checking` | zakończenie obliczenia, błąd wejścia | Jedno krótkie obliczenie; zablokowane ponowne zatwierdzenie |
| `animating` | koniec animacji, „Pokaż wynik” | Wynik już obliczony; pominięcie animacji nie zmienia wyniku |
| `feedback` | poprawa, następny etap, powtórka | Pokazany jeden główny wynik i konkretne następne działanie |
| `awaiting_ai` | odpowiedź, anulowanie, timeout | Wzór i wyjaśnienie zachowane; brak podwójnego wysyłania |
| `awaiting_prediction` | wybór przewidywania, start lotu | Propozycja Piko widoczna, jej wynik ukryty |
| `ai_unavailable` | ponowienie, jawny wybór demo, dozwolona kontynuacja bez propozycji | Nie generować odpowiedzi zastępczej z etykietą AI |
| `completed` | następna misja, powtórzenie, podsumowanie | Postęp zapisany raz; powtórka ma własny identyfikator podejścia |

Nie wysyłać nowego zapytania przez samo wejście do widoku. Pierwsza wypowiedź scenariuszowa jest lokalna. Wysłanie i ponowienie to świadome kliknięcia użytkownika. `turnId` i `sessionRevision` mają chronić przed duplikatami i zastosowaniem starej odpowiedzi w nowej scenie; szczegóły należą do kontraktu API.

## 6. Tryby AI i awarie

| Tryb | Widoczna etykieta | Co wolno komunikować |
|---|---|---|
| `live` | „AI połączone” | Ta odpowiedź pochodzi z modelu; nadal wymaga sprawdzenia matematycznego |
| `demo` | „Tryb demonstracyjny — odpowiedzi przygotowane” | Dialog ilustruje mechanikę; nie dowodzi działania połączenia z modelem |
| `unavailable` | „AI chwilowo niedostępne” | Nie uzyskano odpowiedzi; można ponowić lub wybrać demo jawnie |

Jeśli konfiguracja nie zawiera połączenia z modelem, ekran startowy oferuje „Zagraj w demonstrację”. Nie używa napisu „AI połączone”. Jeśli konfiguracja istnieje, ale zapytanie się nie powiedzie, aplikacja pozostaje w stanie błędu do świadomej decyzji gracza. Zmiana na demo nie kasuje wcześniejszych prób. W podsumowaniu pokazywać, z jakiego trybu faktycznie pochodziły odpowiedzi; możliwa jest historia mieszana.

Matematyczna część gry działa bez modelu. W `robot_transfer` brak użytecznej odpowiedzi po błędzie nie blokuje `human_check`; samodzielna próba ma wartość niezależną od dostępności usługi. W `teach` przejście do pełnej symulowanej rozmowy wymaga jawnego wyboru demo. Gdy wymagania numeryczne są spełnione, awaria modelu nie może oznaczać „Twoje wyjaśnienie jest błędne”.

## 7. Granice obietnicy edukacyjnej

Można powiedzieć: „Gra ćwiczy odczytywanie parametrów funkcji i tłumaczenie własnego rozwiązania” oraz „Po rozmowie jest nowe zadanie bez pomocy AI”. Nie można bez danych powiedzieć: „Gra poprawia wyniki z matematyki”, „Piko nauczył się tak jak człowiek” lub „AI potwierdziło, że rozumiesz temat”.

Podsumowanie ma prezentować rzeczywiste wykonania: np. „4 z 6 pierwszych samodzielnych lotów poprawne; wszystkie 6 misji ukończone”. To opis przebiegu sesji. Nie przeliczać go na diagnozę zdolności, ocenę szkolną ani przewidywany wynik egzaminu.

Pierwszy pilotaż z kilkoma uczniami ma sprawdzić zrozumiałość instrukcji, trudność plansz i to, czy gracze wiedzą, co robi AI. Jeśli później powstanie porównanie skuteczności uczenia, wymaga ono odrębnego projektu badania. W MVP ważniejszy jest uczciwy pomiar zachowania gry niż mocna deklaracja skuteczności.
