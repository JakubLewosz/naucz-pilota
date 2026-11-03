# Interfejs i doświadczenie gracza

Status: specyfikacja wykonawcza MVP. Język interfejsu: polski. Wspólne źródło mechaniki: `02-game-and-learning.md`. Geometryczne wymiary plansz, tolerancje i współczynniki należy pobierać z treści, bez przepisywania do komponentów.

## 1. Kierunek wizualny

Gra ma przypominać czytelny panel sterowania małego robota. Centralnym elementem jest układ współrzędnych z trasą, bramkami i przeszkodami. Użyj prostych kształtów SVG; nie potrzebujemy generowanych ilustracji, zewnętrznych modeli 3D ani sprite'ów do działania MVP.

Piko jest małym zaokrąglonym kwadratem z dwoma oczami. Jego faktyczny obszar kolizji jest **kwadratem równoległym do osi o połowie boku 0,12 jednostki świata**. Zaokrąglenie rysunku jest dekoracją; przy zbliżeniu lub przełączniku „Pokaż obrys” pokazuj kwadratowy obrys. Nie rysuj obracającego się drona, jeśli kolizje pozostają osiowe.

### 1.1. Tokeny wizualne

Zastosuj jasny motyw jako jedyny obowiązkowy wariant. Zaproponowane kolory są decyzją projektową, nie dowodem spełnienia norm kontrastu; przed akceptacją trzeba sprawdzić rzeczywiste pary tekst/tło.

| Token | Wartość początkowa | Zastosowanie |
|---|---|---|
| `background` | `#F4F6FB` | Tło aplikacji |
| `surface` | `#FFFFFF` | Karty, panel roboczy |
| `text` | `#172033` | Główny tekst |
| `text-muted` | `#49576D` | Opisy pomocnicze |
| `primary` | `#2457D6` | Główna akcja i neutralna trajektoria |
| `success` | `#176845` | Sukces razem z ikoną i tekstem |
| `danger` | `#A62B36` | Zderzenie razem z oznaczeniem miejsca |
| `warning` | `#815600` | Ostrzeżenie na jasnym tle |
| `border` | `#CBD3E1` | Granice paneli i pól |

Zwykły tekst interfejsu: systemowy sans-serif, 16 px. Równania i współrzędne: czytelny krój monospace z lokalnego systemu. Nagłówki 22–30 px; nie pomniejszać wzoru poniżej 18 px w głównym edytorze. Zaokrąglenia paneli 12–16 px, cienie oszczędne. Nie używać rozmytego tła i półprzezroczystości tam, gdzie utrudniają odczyt wykresu.

Nie wprowadzać na start ciemnego motywu, wyboru skórek, systemu walut, odznak za logowanie ani avatara użytkownika.

## 2. Ekrany

### 2.1. Ekran startowy

Treść nad pierwszą akcją:

> **Naucz Pilota**  
> Napisz funkcję. Wyznacz bezpieczny tor. Naucz Piko, dlaczego działa.

Widoczne akcje:

- „Zacznij” albo „Kontynuuj — misja 3 z 6”, zależnie od lokalnego postępu.
- „Misje” — lista sześciu misji i ich rzeczywisty status.
- „Jak działa Piko?” — krótki opis roli AI, trybu demonstracyjnego i przechowywania reguł.
- „Ustawienia” — dźwięk, ograniczenie animacji, obrys robota, usunięcie lokalnego postępu; brak kont i logowania.

Przed rozpoczęciem pokaż stan połączenia. Nie pozwalaj, by pierwsza tura AI była momentem odkrycia, że aplikacja działa wyłącznie w demo. Klucza API nie wpisuje się w interfejsie gracza; konfiguracja należy do backendu i instrukcji uruchomienia.

### 2.2. Lista misji

Sześć kart w kolejności. Każda: numer, nazwa, umiejętność jednym zdaniem, stan „Dostępna”, „W toku”, „Ukończona” albo „Odblokujesz po misji …”. Ukończona karta może pokazywać „Pierwszy samodzielny lot: poprawny / do poprawy”.

Nie pokazywać 100% opanowania tematu. Nie udostępniać w UI odpowiedzi referencyjnych ani edytora treści. Do demonstracji konkursowej można przygotować wcześniej rozegrany profil; nie potrzebujemy osobnego, ukrytego mechanizmu fałszującego postęp.

### 2.3. Widok misji na komputerze

Docelowy układ dla szerokości od 1120 px:

- Górny pasek: „Misja 4/6”, tytuł, cztery nazwane etapy, etykieta trybu AI, przycisk wyjścia.
- Obszar główny: plansza po lewej, około dwóch trzecich dostępnej szerokości; po prawej panel etapu o minimalnej szerokości 300 px.
- Bezpośrednio pod planszą: edytor funkcji, widoczne ograniczenia oraz główna akcja.
- Pod edytorem: jeden komunikat wyniku; dalsze szczegóły w rozwijanym „Dlaczego?”.
- Panel boczny: cel etapu, wypowiedzi Piko lub podsumowanie, dwie prognozy w `teach`, lokalna historia ostatnich prób. Dziennik reguł otwierany osobnym przyciskiem, z wyjątkiem `human_check`.

Plansza ma zajmować większość uwagi. Po otrzymaniu wypowiedzi AI nie przesuwać nagle widoku i nie zmniejszać wykresu. Historia rozmowy przewija się we własnym panelu.

### 2.4. Mniejsze ekrany

Od 768 do 1119 px: plansza i edytor na pełną szerokość, panel etapu pod nimi; górny pasek może zawijać etapy. Poniżej 768 px: jedna kolumna, kompaktowa lista etapów, plansza zawsze przed formularzem i rozmową.

Na wąskim ekranie skaluj SVG z zachowaniem jednakowej skali jednostek w obu osiach. Nie rozciągaj osobno osi x i y, bo wizualnie zmieniłoby to nachylenie i szerokość paraboli. Jeśli proporcje domeny wymuszają wolne miejsce, użyj marginesu wokół układu, nie deformacji. Bez automatycznego przesuwania planszy wraz z robotem; geometria zadania powinna pozostawać stała.

Dotykowe przyciski mają mieć co najmniej 44 × 44 px. Osiągalny cel MVP to działanie od szerokości 360 px bez poziomego przewijania całej strony. Jeśli same etykiety liczbowe muszą zostać ograniczone, pokazuj mniej podpisów siatki, zachowując dostępność wszystkich współrzędnych w opisie planszy.

### 2.5. Podsumowanie misji i gry

Po misji pokaż trzy osobne sekcje:

1. „Zasada zapisana dla Piko” — treść kanoniczna.
2. „Lot Piko” — wynik jego propozycji i źródło odpowiedzi: model albo demonstracja.
3. „Twój samodzielny lot” — wynik pierwszej próby, liczba prób do ukończenia i ewentualne „po powtórce”.

Główna akcja: „Następna misja” lub w M06 „Zobacz podsumowanie”. Dodatkowa: „Powtórz misję” z wyjaśnieniem, że nie wymaże pierwszego podejścia.

Na końcu gry: sześć wierszy umiejętności oraz konkretne wykonania. Napis „Dobra robota — ukończyłeś sześć misji” może świętować ukończenie. Nie dodawaj „Jesteś ekspertem od funkcji” ani fikcyjnego certyfikatu.

## 3. Plansza i znaczenie elementów

| Element | Wygląd | Znaczenie i interakcja |
|---|---|---|
| Start | Oznaczenie `S` i pionowy otwór z dwiema krawędziami | Tor musi przechodzić w dozwolonym przedziale z uwzględnieniem rozmiaru Piko |
| Cel | Flaga i `CEL`, pionowy otwór | To przedział, nie bezwymiarowy punkt |
| Bramka | Dwie krótkie belki i nazwa, np. G1 | Wolna przestrzeń pomiędzy belkami; gracz widzi jej granice |
| Przeszkoda | Pełny prostokąt z kreskowaniem | Obszar zabroniony, także gdy kolor nie jest rozróżniany |
| Granice planszy | Wyraźna rama | Cały robot musi mieścić się w domenie pionowej |
| Podgląd funkcji | Przerywana niebieska linia | Przewidywana geometria, bez werdyktu przed zatwierdzeniem |
| Przebyty tor | Linia ciągła z poruszającym się Piko | Animacja zatwierdzonego wzoru |
| Miejsce porażki | Krzyżyk, krótka etykieta i tekst pod planszą | Konkretne zdarzenie zwrócone przez silnik |

Współrzędne i zakresy opisuj także tekstowo w rozwijanym panelu „Dane planszy”. Ten panel nie oblicza rozwiązania. Jeśli widoczne są ograniczenia, np. stały współczynnik, pokazuj je nad edytorem przez cały etap. Współrzędne bramek G1/G2 w `teach` muszą odpowiadać polom prognoz.

Używaj tego samego odwzorowania world→screen do rysowania krzywej, robota i obiektów. Przesunięcie toru w pionie „żeby wystartował przy robocie” jest zabronione: zmieniłoby znaczenie wyrazu wolnego. Piko pojawia się przy rzeczywistej wartości `f(xMin)`; chybiony start jest widoczną, wyjaśnioną porażką.

## 4. Edytor funkcji

Jedno pole tekstowe z nieruchomą etykietą `f(x) =`. Obsługiwane formy opisuje parser, m.in. `2x + 1`, `0.5(x - 2)^2 + 1` i równoważne wyrażenia stopnia najwyżej drugiego. Nie wprowadzaj pełnego edytora LaTeX.

Pod polem pokazuj krótką pomoc: „Użyj x, liczb, + − × /, nawiasów i potęgi 2”. Przycisk `x²` może wstawić tekst `x^2` w miejscu kursora; przyciski matematyczne nie zastępują zwykłej klawiatury. Nie potrzebujemy automatycznego uzupełniania całych rozwiązań.

W `practice` i `teach` neutralny podgląd aktualizuje się po krótkim opóźnieniu wpisywania; powolny komputer nie może blokować pisania. Obliczanie kolizji i wynik etapu wymagają świadomego zatwierdzenia. W `human_check` przed pierwszą próbą podgląd jest wyłączony.

Przy niepoprawnej składni zachowaj całą treść i pokaż wskazanie fragmentu, jeśli parser je zna. Komunikaty powinny wyjaśniać ograniczenie, np. „W tej wersji możesz użyć funkcji do stopnia 2” albo „Dzielenie jest dozwolone tylko przez stałą różną od zera”. Nie pokazuj surowego wyjątku parsera ani stosu błędów.

## 5. Animacja i tempo

Lot ma zwykle trwać 2–4 sekundy niezależnie od rozdzielczości. Czas jest decyzją animacji, nie fizyczną symulacją ruchu po paraboli. Piko przesuwa się monotonicznie od xMin do xMax, a y wynika z funkcji. Nie dodawaj grawitacji, prędkości, odbić ani sił, które sugerowałyby inną matematykę.

Przed animacją wynik jest znany. Dla kolizji animacja kończy się przy pierwszym fizycznym kontakcie; komunikat główny może odpowiadać ustalonemu priorytetowi walidatora. Jeśli są różne błędy, „Dlaczego?” wyjaśnia ich kolejność bez sprzeczności z tym, co pokazano.

Podczas lotu dostępny jest przycisk „Pokaż wynik”. Przy preferencji ograniczonego ruchu lub ustawieniu użytkownika przechodź od razu do statycznego toru i rezultatu. Bez migania, potrząsania całym ekranem i dźwięku obowiązkowego do zrozumienia porażki.

## 6. Mikrocopy stanów i błędów

Poniższe teksty są wzorcami; szczegóły współrzędnych podstawia silnik, bez wypowiedzi modelu jako źródła liczb.

| Sytuacja | Tekst |
|---|---|
| Początek ćwiczenia | „Ułóż tor, który przeprowadzi Piko przez bramki i ominie przeszkody.” |
| Naprawa robota | „Piko ma pomysł. Sprawdź go, a potem wyjaśnij, co warto zmienić.” |
| Prognozy | „Zanim sprawdzisz lot, przewidź dwie wartości funkcji.” |
| Prognoza niezgodna | „Dla x = … Twój wzór daje y = …. Porównaj to ze swoją prognozą.” |
| Zaliczone liczby | „Tor i obie prognozy są poprawne. Zapisz zasadę, z której Piko skorzysta dalej.” |
| Opinia AI | „Tak Piko odczytał Twoje wyjaśnienie. Wynik matematyczny sprawdza silnik.” |
| Chybiony start | „Tor omija otwór startowy. Sprawdź wartość funkcji przy x = ….” |
| Wyjście z planszy | „W tym miejscu Piko wychodzi poza planszę. Cały robot musi zmieścić się w jej granicach.” |
| Kolizja | „Piko dotyka przeszkody … przy x ≈ …. Zostaw miejsce na jego szerokość.” |
| Chybiona bramka | „Piko nie mieści się w bramce …. Sprawdź tor przy x = ….” |
| Niewłaściwa rodzina | „W tej misji użyj funkcji ….” |
| Ograniczenie współczynników | „Ta misja wymaga …. Możesz zmieniać ….” |
| Sukces gracza | „Bezpieczny lot. Wszystkie bramki zaliczone.” |
| Nieudany transfer robota | „Pomysł Piko nie działa na tej planszy. To wynik jego próby — możesz teraz sprawdzić się sam.” |
| Brak poprawnego wzoru AI | „Piko nie przygotował poprawnego wzoru. Możesz ponowić próbę albo przejść do własnego lotu.” |
| Pierwsza samodzielna próba | „Nowa plansza, teraz bez podpowiedzi. Tor zobaczysz po zatwierdzeniu wzoru.” |
| Błąd składni w teście | „Popraw zapis wzoru. Ta próba nie została jeszcze zaliczona do historii.” |
| AI czeka | „Piko przygotowuje odpowiedź…” |
| Timeout | „Nie udało się otrzymać odpowiedzi. Twój wzór i wyjaśnienie są zachowane.” |
| Przełączenie demo | „Tryb demonstracyjny używa przygotowanych odpowiedzi. W tej części nie rozmawiasz z modelem.” |
| Stara odpowiedź | Brak komunikatu alarmowego; ignoruj wynik z wcześniejszej sceny i nie zmieniaj bieżącego wzoru |

Po błędzie połączenia pokaż dwie główne akcje: „Spróbuj ponownie” i „Wybierz tryb demonstracyjny”. Jeśli limit został osiągnięty, wyjaśnij go po polsku i pokaż ponowienie dopiero wtedy, gdy ma sens. Nie obiecuj dokładnego czasu naprawy zewnętrznej usługi.

## 7. Klawiatura i dostępność

- Wszystkie przyciski, edytor, prognozy i wybór przewidywania dostępne przez Tab; widoczny obrys fokusu.
- Enter w jednowierszowym edytorze uruchamia główną akcję tylko wtedy, gdy nie trwa wysyłanie lub animacja. Enter w polu wyjaśnienia wstawia nowy wiersz; wysłanie jest przyciskiem, ewentualnie Ctrl+Enter z widoczną informacją.
- Escape zamyka pomoc lub dziennik, lecz nie kasuje treści formularzy. Nie przypisuj pojedynczych liter do globalnych skrótów, które przeszkadzają w pisaniu wzoru.
- Wyniki i błędy mają tekstowy opis; `aria-live="polite"` ogłasza wynik raz po zakończeniu obliczenia. Nie ogłaszaj każdej klatki animacji ani każdego znaku wzoru.
- Etykiety pól zawierają cel: „Wzór funkcji”, „Prognoza y dla x = …”, „Wyjaśnienie dla Piko”. Placeholder nie zastępuje etykiety.
- Sukces i porażka używają tekstu oraz symbolu, a nie samej zieleni i czerwieni. Przeszkody mają kreskowanie, bramki podpisy i inny kształt.
- Powiększenie tekstu do 200% nie ukrywa akcji. Plansza ma tekstowe „Dane planszy” i wynik, ale nie deklaruj pełnej dostępności dydaktycznej dla użytkowników niewidomych bez osobnego sprawdzenia.
- `prefers-reduced-motion` jest respektowane domyślnie. Zmiana ustawienia nie wpływa na wynik matematyczny.

## 8. Informacje o danych

W „Jak działa Piko?” umieść krótki, konkretny opis: „Postęp zapisujemy na tym urządzeniu. W trybie AI wysyłamy do skonfigurowanej usługi treść Twojego wyjaśnienia i opis bieżącej planszy. Nie potrzebujesz konta ani danych osobowych. Nie wpisuj ich do rozmowy”. Szczegóły zależą od faktycznie wdrożonej architektury i muszą zostać uaktualnione przed udostępnieniem aplikacji.

Nie stosować rozbudowanego ekranu zgód w MVP bez rzeczywistej potrzeby. Ustawienia zawierają „Usuń lokalny postęp” z potwierdzeniem opisującym zakres usunięcia. Usunięcie postępu nie może obiecywać usunięcia danych z usługi modelu, jeśli aplikacja nie ma takiej możliwości.

## 9. Scenariusz pokazu konkursowego — 4 minuty 30 sekund

To plan nagrania rzeczywiście działającej aplikacji, nie animatyku. Przed nagraniem przygotuj profil z ukończonymi wcześniejszymi misjami, aby szybko wejść do M04. Wybrane odpowiedzi mogą być przećwiczone; nie przedstawiaj występu autora jako badania skuteczności uczenia. Połączenie AI musi być prawdziwe i widocznie oznaczone. Przy awarii nagraj działający przebieg innym razem albo jawnie opisz pokaz demo.

| Czas | Obraz i działanie | Co widz ma zrozumieć |
|---|---|---|
| 0:00–0:25 | Start, lista sześciu misji, otwarcie M04 | Gracz uczy funkcji, tłumacząc robotowi jego błąd |
| 0:25–0:55 | Krótka samodzielna próba; pokaz toru i bramek | Wpisany wzór realnie steruje trasą i ma sprawdzany wynik |
| 0:55–1:45 | Błędny pomysł Piko, poprawa, dwie prognozy, jedno wyjaśnienie | Gracz nie tylko kopiuje odpowiedź, lecz przewiduje i tłumaczy |
| 1:45–2:20 | Rzeczywista odpowiedź modelu, zapis reguły | Rola AI jest widoczna, a matematykę potwierdza silnik |
| 2:20–3:10 | Nowa plansza, propozycja Piko, przewidywanie i lot | Robot stosuje regułę na nowej geometrii; jego błąd jest dopuszczalny i jawny |
| 3:10–4:00 | Odrębna plansza `human_check`, brak podglądu przed zatwierdzeniem, lot gracza | Istnieje sprawdzenie gracza bez pomocy AI |
| 4:00–4:30 | Podsumowanie, krótka informacja o walidacji i rzeczywistej implementacji | Co zbudowano, jak sprawdzono poprawność i gdzie kończą się deklaracje projektu |

Jeżeli czas odpowiedzi modelu wymaga cięcia, montaż nie może sugerować, że wynik pochodził z innej treści lub że nie było awarii. Pięciominutowy limit konkursu pozostawia 30 sekund zapasu na planszę tytułową i końcową.

## 10. Warunki odbioru UX

1. Nowy użytkownik rozpoznaje cel pierwszej planszy bez instrukcji mówionej od autora.
2. Po porażce umie wskazać na ekranie, co poszło źle, oraz ponownie uruchomić zmieniony wzór.
3. W `teach` widzi różnicę między opinią Piko a obliczonym wynikiem i nie musi dyskutować z błędną opinią AI, aby przejść dalej.
4. Przed pierwszą próbą `human_check` żadna funkcja UI nie ujawnia trajektorii, obliczonych y lub poprawności wzoru.
5. Po wyłączeniu sieci interfejs zachowuje wpisany tekst, pokazuje stan błędu i nie udaje połączenia AI.
6. Całą podstawową misję można przejść klawiaturą; ograniczenie animacji nie zmienia ocen.
7. Widok działa przy 360, 768 i 1366 px szerokości oraz powiększeniu tekstu, bez zasłoniętego przycisku głównej akcji.
8. Zrzut podsumowania pozwala odróżnić wynik robota, wynik pierwszej próby gracza i późniejsze ukończenie.

Te punkty wymagają sprawdzenia na działającej aplikacji. Sam dokument nie stanowi ich zaliczenia.
