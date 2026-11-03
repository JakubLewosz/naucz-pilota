# Silnik matematyczny i 24 plansze

Wersja kontraktu: `1.0.0`. Gra: **Naucz Pilota**, robot: **Piko**. Ten dokument opisuje zachowanie do zaimplementowania. Dołączony skrypt Python jest walidatorem projektu i niezależną referencją obliczeń; nie stanowi gotowego silnika aplikacji.

## 1. Źródło prawdy i zakres

O powodzeniu lotu decyduje deterministyczny silnik matematyczny. Model językowy może zaproponować wzór, skomentować wyjaśnienie lub zadać pytanie jako uczeń, ale nie nadaje wyniku `SUCCESS`, nie obchodzi blokad parametrów i nie rozstrzyga kolizji.

W MVP obsługujemy wyłącznie funkcje wielomianowe jednej zmiennej, stopnia najwyżej 2:

\[
f(x)=c_2x^2+c_1x+c_0.
\]

Silnik przyjmuje wszystkie dozwolone wzory, które spełniają warunki planszy. Nie porównuje wpisanego tekstu ze wzorem referencyjnym. Na przykład `0.25(x-2)^2+1`, `(x^2-4x+8)/4` i `0.25x^2-x+2` opisują tę samą funkcję.

Pliki danych:

| Plik | Rola |
|---|---|
| `content/missions.v1.json` | Sześć misji, 24 sceny, ograniczenia i geometria, rozwiązania kontrolne, znane błędy. |
| `content/missions.schema.json` | Zamknięty schemat JSON danych misji. Nieznane pola są błędem. |
| `content/skills.v1.json` | Identyfikatory umiejętności, zależności, reguły kanoniczne i punkty dowodu liczbowego. |
| `tools/validate_missions.py` | Kontrola struktury, parsera, rozwiązywalności oraz spodziewanych kategorii błędu. |

`witness` i `knownFailures` służą autorowi, testom i audytowi. Eksport danych do interfejsu gracza oraz kontekst wysyłany do modelu muszą je pomijać. Nie wolno zastępować nimi nieudanego wyniku modelu w trybie live. W publicznym repozytorium mogą pozostawać materiałem technicznym; próba samodzielna jest ćwiczeniem w aplikacji, a nie zabezpieczonym egzaminem.

## 2. Misja składa się z czterech odrębnych scen

| Rola | Działanie | Dostępna pomoc |
|---|---|---|
| `practice` | Gracz poznaje daną zmianę wykresu i przeprowadza lot. | Wskazówki i eksperymentowanie. |
| `teach` | Gracz poprawia przykładowy błędny lot Piko, sam wyjaśnia regułę i sprawdza dwa wyniki liczbowe. | Pomoc dopuszczalna; przykładowy błąd robota jest jawnie przygotowany dydaktycznie. |
| `robot_transfer` | Piko proponuje wzór na innej planszy, korzystając z zaakceptowanej reguły kanonicznej. | Model lub jawnie oznaczony tryb demonstracyjny; każda propozycja przechodzi pełną walidację. |
| `human_check` | Gracz rozwiązuje kolejną, wcześniej niepokazaną planszę. | Brak wskazówek, pokazu rozwiązania Piko i podglądu wzoru referencyjnego. |

Identyfikator sceny to np. `M04-human_check`. Punkty kontrolne mają klucze `start`, `G1`, `G2`, `goal`; pełny klucz zawsze obejmuje też `sceneId`. Identyfikatory przeszkód: `O1`, ewentualnie `O2` itd.

Wszystkie sceny `human_check` zaczynają się od neutralnego wzoru bazowego. M01 ma `0`, M02 ma `x+5` z ujawnionym przez blokadę wyrazem wolnym 5, a M03–M06 mają `0.25x^2`. Pole początkowe nie liczy się jako próba, dopóki gracz nie uruchomi lotu. Nie podstawiaj do niego ostatniego wzoru z transferu robota.

Powodzenie robota, powodzenie człowieka, pierwsza próba, liczba kolejnych prób oraz użycie pomocy są osobnymi obserwacjami. Udany transfer robota nie stanowi dowodu, że człowiek opanował temat. Nie należy na podstawie tej krótkiej sesji deklarować trwałej wiedzy lub udowodnionej skuteczności edukacyjnej.

## 3. Układ współrzędnych i wygląd planszy

- Jednostką reguł jest jednostka matematyczna, niezależna od pikseli i powiększenia ekranu.
- Oś x rośnie w prawo, oś y w górę. Przy rysowaniu na ekranie odwróć znak współrzędnej pionowej.
- Piko porusza się od `domain.xMin` do `domain.xMax`. Wolno używać ujemnych x.
- `start.x = domain.xMin`, `goal.x = domain.xMax`. Wewnętrzne bramki są uporządkowane rosnąco po x.
- Granice x opisują odcinek lotu środka robota; nie są ścianami, od których odejmuje się półbok robota. Granice y są krawędziami bezpiecznego obszaru lotu.
- Skala pozioma i pionowa powinna być taka sama w pikselach na jednostkę. Gdy proporcje okna się nie zgadzają, dodaj margines do renderowania, zachowując rzeczywisty obszar `domain` jako odrębny prostokąt. Nie rozciągaj osi niezależnie, bo zmienia to wizualne nachylenie i szerokość paraboli.
- Pokazuj osie, podziałkę, współrzędne istotnych punktów oraz pełną informację o blokadach parametrów.
- Piko wygląda jak zaokrąglony kwadrat. Jego matematyczny obrys kolizji pozostaje kwadratem równoległym do osi; dekoracja nie może sugerować obrotowego obrysu lub koła.

Bramki są **punktami kontroli prześwitu przy określonym x**, a nie fizycznymi ścianami. Rysuj je jako czytelne oznaczenie dozwolonego przedziału y. Nie dorysowuj poza nim nieopisanych w danych przeszkód. Pozwala to zachować dokładnie zdefiniowaną regułę: przy x bramki sprawdzana jest wysokość środka robota i jego pionowy obrys.

## 4. Bezpieczny parser wzoru

### 4.1. Dozwolony język

Obsługuj:

- liczby całkowite i dziesiętne, np. `2`, `0.25`, `.5`;
- przecinek dziesiętny **między cyframi**, np. `0,5x+1,25`; przecinek nie jest separatorem argumentów ani tysięcy;
- zmienną `x`, działania `+`, `-`, `*`, `/`, nawiasy i jednoargumentowe plus/minus;
- potęgowanie przez literalną cyfrę `0`, `1` lub `2`;
- mnożenie niejawne: `2x`, `2(x+1)`, `x(x+1)`, `(x+1)(x-1)`;
- znak `²` jako zapis `^2`, `−` jako `-`, `×` jako `*`;
- opcjonalny prefiks `y=` albo `f(x)=`, z odstępami;
- białe znaki pomiędzy tokenami.

Nie obsługuj innych zmiennych, funkcji, notacji naukowej `1e3`, przypisań, tablic, dostępu do właściwości, instrukcji programowania ani dowolnego wykonywania kodu. `eval`, `Function` i wykonanie tekstu wejściowego jako JavaScript/Python są zabronione. Nie przesyłaj niepoprawnego wzoru do modelu z prośbą, aby ocenił go zamiast parsera.

Przykłady akceptowane: `0,5x+2`, `f(x)=0.25(x-2)²+1`, `(x+1)(x-1)`, `x/(2+2)`.

Przykłady odrzucane: `sin(x)`, `1/x`, `x^3`, `x^2^2`, `x^-1`, `1,2,3`, `x2`, `2 3`, `(x+1)2`, `0^0`, `window.alert(1)`.

### 4.2. Gramatyka i kolejność działań

```text
sum       := product (("+" | "-") product)*
product   := unary (("*" | "/" | IMPLICIT_MULTIPLY) unary)*
unary     := ("+" | "-") unary | power
power     := atom ("^" ("0" | "1" | "2"))?
atom      := NUMBER | "x" | "(" sum ")"
```

Potęgowanie ma pierwszeństwo przed jednoargumentowym minusem: `-x^2` oznacza `-(x^2)`, a `(-x)^2` oznacza `x^2`. Nie obsługuj łańcucha potęg. Operator potęgowania oraz jego literalny wykładnik liczą się jako osobne węzły AST.

Dzielenie i mnożenie, także niejawne, mają ten sam priorytet i są wykonywane od lewej. `1/2x` oznacza `(1/2)*x`. Interfejs może zachęcać do jednoznacznego zapisu z nawiasami, ale nie może zmieniać tej semantyki. `1/(2x)` jest odrzucane, ponieważ mianownik nie jest stały.

Dzielenie jest dopuszczalne tylko przez wielomian, który po algebraicznym uproszczeniu jest niezerową stałą. `x/(x-x+2)` jest więc dopuszczalne. `x/x` jest odrzucane: aplikacja nie skraca funkcji wymiernych i nie wprowadza wyjątków dziedziny.

Wielomian `p(x)^0` daje stałą 1, chyba że `p` jest identycznie zerowym wielomianem; zapis `0^0` jest odrzucany jako nieokreślony. W szczególności `x^0` jest stałą 1 w całym obszarze gry.

### 4.3. Limity zasobów

| Ograniczenie | Wartość |
|---|---:|
| Długość wejścia przed normalizacją | 120 znaków Unicode, łącznie z prefiksem i odstępami |
| Węzły AST | 64 |
| Głębokość AST | 16 |
| Zagnieżdżenie nawiasów i operatorów jednoargumentowych | 16 |
| Wartość bezwzględna dowolnego współczynnika pośredniego i końcowego | 10000 |
| Stopień dowolnego pośredniego wielomianu | 2 |
| Bity licznika i mianownika zredukowanej liczby wymiernej | 2048 |

Nie wolno najpierw obliczyć dowolnie dużego lub wysokiego stopnia wyrażenia i dopiero sprawdzić końcowego wyniku. Na przykład `x*x*x-x*x*x` jest odrzucane na pierwszym wielomianie stopnia 3, a `10001-10001+x` na przekroczeniu limitu współczynnika. To celowo ograniczony język dydaktyczny.

Dokładne uproszczenie powinno operować na liczbach wymiernych utworzonych z literałów dziesiętnych. W Pythonie referencyjnym służy do tego `Fraction`; implementacja TypeScript może użyć par `bigint` z redukcją przez NWD i tym samym limitem bitów. Dzięki temu `0.1x+0.2x-0.3x` jest dokładnie zerem. Dopiero kanoniczne współczynniki zamień na `float64` do geometrii. Jeśli niezerowa liczba wymierna zamieniłaby się w zero przez niedomiar reprezentacji, zwróć `COEFFICIENT_UNDERFLOW`. Nie wolno cicho zmienić rodziny funkcji przez tę konwersję.

Wszystkie wartości końcowe muszą być skończone. `NaN` i `Infinity` nie należą do gramatyki. Kontroluj limity podczas parsowania, a nie tylko po nim.

### 4.4. Błędy parsera

Utrzymuj rozróżnienie między błędem zapisu a nieudanym lotem. W MVP wystarczają stabilne kody:

`EMPTY_EXPRESSION`, `UNSUPPORTED_TOKEN`, `SYNTAX_ERROR`, `UNSUPPORTED_EXPONENT`, `DEGREE_LIMIT`, `NON_CONSTANT_DIVISOR`, `DIVISION_BY_ZERO`, `UNDEFINED_POWER`, `COEFFICIENT_LIMIT`, `COEFFICIENT_UNDERFLOW`, `EXPRESSION_TOO_COMPLEX`.

Wyjaśnienie dla gracza jest po polsku i wskazuje konkretny problem, np. „W tej wersji możesz dzielić wyłącznie przez liczbę”. Przy błędzie parsera nie uruchamiaj animacji i nie zaliczaj matematycznej próby lotu. Można odrębnie zapisać fakt błędu zapisu, bez zapisywania całych rozmów.

## 5. Normalizacja, rodzina i blokady

Kanoniczny wynik parsera przechowuje `c2`, `c1`, `c0`. Do obliczania wartości używaj schematu Hornera:

\[
f(x)=(c_2x+c_1)x+c_0.
\]

Rodzina wynika z rzeczywistego zera po symbolicznym uproszczeniu:

| Warunek | Rodzina |
|---|---|
| `c2 != 0` | `quadratic` |
| `c2 == 0 && c1 != 0` | `linear` |
| `c2 == 0 && c1 == 0` | `constant` |

Nie traktuj małego, ale niezerowego `c2` jako zera. `1/1000000000*x^2` jako tekst przekracza wprawdzie limit literału pośredniego, ale równoważny dozwolony zapis małego współczynnika nadal oznacza parabolę. Tolerancja geometrii nie definiuje stopnia wielomianu.

`coefficientLocks` zawiera wyłącznie parametry, które gracz ma zachować. Każdą podaną blokadę porównuj ze współczynnikiem kanonicznym, z tolerancją bezwzględną `epsilon = 1e-9`. Nie oceniaj blokady po wyglądzie wpisanego wzoru. Puste `{}` oznacza brak blokad współczynników.

Opcjonalne `vertexLock` może określać `x` lub `y` wierzchołka:

\[
x_v=-\frac{c_1}{2c_2},\qquad y_v=f(x_v).
\]

W M04 blokada `c2=0.25` oraz `vertexLock.y=0` pozwala zmieniać wyłącznie poziome położenie paraboli. Sama blokada `c0=0` byłaby błędna: przesunięcie poziome zmienia także wyraz wolny po rozwinięciu nawiasu. Dla funkcji niebędącej parabolą nie istnieje wierzchołek tego rodzaju, więc warunek `vertexLock` jest niespełniony.

Nie odwracaj kolejności: najpierw sprawdzana jest dozwolona rodzina, a dopiero potem blokady. W M05 wszystkie wzory referencyjne mają dodatnią krzywiznę. Ujemna parabola pozostaje składniowo poprawna, ale nie przejdzie dodatnio położonych bramek tych plansz; nie dodawaj ukrytej blokady niewystępującej w danych.

## 6. Geometria ciągła

Wspólne reguły z pliku danych:

```json
{
  "hitboxHalfSize": 0.12,
  "epsilon": 1e-9,
  "contactIsCollision": true
}
```

### 6.1. Obrys Piko i przedziały przejścia

Piko ma kwadratowy obrys o boku 0.24 jednostki, czyli półboku `r=0.12`. Nie zmienia się on wraz z kolorem, obrotem dekoracji lub rozdzielczością.

Dla startu, bramki i mety `[yMin, yMax]` środek robota musi spełniać:

\[
yMin+r-\epsilon\le f(x)\le yMax-r+\epsilon.
\]

Zmieszczenie się dokładnie na granicy prześwitu jest dozwolone. To różni się od dotknięcia przeszkody, które jest kolizją. Bramka o wysokości mniejszej niż `2r` jest wadliwą planszą; walidator ją odrzuca.

### 6.2. Dokładny zakres funkcji na przedziale

Dla przedziału `[a,b]`:

1. Oblicz `f(a)` i `f(b)`.
2. Jeśli `c2 != 0`, oblicz `xv=-c1/(2c2)`.
3. Jeśli `a <= xv <= b`, dodaj `f(xv)`.
4. Minimum i maksimum tej listy są pełnym zakresem wartości wielomianu na przedziale.

W implementacji dostęp do zakresu powinien być czystą funkcją, np. `polynomialRange(coefficients, a, b)`. Działa również dla funkcji liniowych, stałych, ujemnej krzywizny i przedziału jednopunktowego.

**Nie ustalaj wyniku na podstawie próbek wykresu, pikseli, punktów animacji lub częstotliwości klatek.** Zbyt wąska przeszkoda może znajdować się między próbkami, a parabola może opuścić obszar pomiędzy poprawnymi końcami.

### 6.3. Granice pionowe planszy

Wyznacz pełny zakres `[low,high]` na całym odcinku x. Lot mieści się w obszarze wtedy i tylko wtedy, gdy:

\[
low\ge domain.yMin+r-\epsilon
\]

oraz

\[
high\le domain.yMax-r+\epsilon.
\]

Przykład kontrolny: `0.25x^2-x` na `[0,4]` ma oba końce na wysokości 0, ale wierzchołek `(2,-1)`. Sama kontrola końców błędnie zaliczyłaby obszar o dolnej granicy -0.8.

### 6.4. Prostokątne przeszkody

Dla przeszkody `[oxMin,oxMax] × [oyMin,oyMax]` rozszerz prostokąt o półbok robota:

\[
[oxMin-r,\ oxMax+r]\times[oyMin-r,\ oyMax+r].
\]

Odetnij jego przedział x do dziedziny lotu. Gdy przecięcie jest puste, pomiń przeszkodę. Na niepustym przedziale oblicz dokładny zakres funkcji `[low,high]`. Kolizja występuje, jeśli:

\[
high\ge oyMin-r-\epsilon\quad\land\quad low\le oyMax+r+\epsilon.
\]

Ten warunek jest wystarczający, ponieważ wielomian jest ciągły: przyjmuje wszystkie wartości pomiędzy swoim minimum i maksimum na spójnym przedziale. Nie chodzi o porównanie obwiedni całego wykresu z całą przeszkodą; zakres obliczany jest **tylko na wspólnym przedziale x**.

Dotknięcie rozszerzonego prostokąta oznacza kontakt obrysu Piko z przeszkodą i jest kolizją. Różnice mniejsze od `epsilon` traktuj konserwatywnie jako kontakt. Dodatni odstęp większy od epsilon jest bezpieczny.

### 6.5. Kolejność wyniku

Po poprawnym parsowaniu raportuj pierwszą pasującą kategorię w następującej kolejności:

| Priorytet | Kod | Znaczenie |
|---:|---|---|
| 1 | `FAMILY_MISMATCH` | Na tej scenie wybrano niedozwolony stopień/rodzinę. |
| 2 | `CONSTRAINT_VIOLATION` | Zmieniono zablokowany współczynnik lub położenie wierzchołka. |
| 3 | `START_MISS` | Robot nie mieści się w przejściu startowym. |
| 4 | `OUT_OF_BOUNDS` | Którykolwiek fragment toru wykracza poza pionowy obszar planszy. |
| 5 | `OBSTACLE_COLLISION` | Tor dotyka co najmniej jednej przeszkody. |
| 6 | `GATE_MISS` | Nieprzejście przez którąkolwiek bramkę lub metę. |
| — | `SUCCESS` | Żaden z powyższych warunków nie wystąpił. |

Brak trafienia w metę również ma kod `GATE_MISS`, z `checkpointId="goal"`. UI może powiedzieć „Piko minął metę”, zachowując ten sam kod danych.

Oprócz głównego kodu silnik powinien umieć zwrócić współczynniki, faktyczne wartości w punktach kontrolnych, zakres pionowy i identyfikatory niespełnionych warunków. AI otrzymuje takie sprawdzone fakty. Nie powinno samodzielnie zgadywać, dlaczego lot się nie udał. Sam `START_MISS` nie dowodzi konkretnego błędnego przekonania ucznia.

### 6.6. Animacja a wynik

Wynik walidacji powstaje przed animacją i jest niezależny od jej szybkości. Tor można próbkować do narysowania linii i animowania ruchu; nie wolno w ten sposób ustalać zaliczenia.

Priorytet powyżej określa główny komunikat, a nie kolejność zdarzeń fizycznych. Jeśli tor najpierw dotyka przeszkody, a później wychodzi poza planszę, animacja powinna zatrzymać się przy pierwszym kontakcie, choć główna kategoria walidacji pozostaje `OUT_OF_BOUNDS`.

Aby wyznaczyć pierwszą kolizję, rozwiązuj równania `f(x)=dolnaGranica` i `f(x)=górnaGranica` rozszerzonej przeszkody, dodaj końce jej odcinka x i wybierz pierwszy punkt wejścia do zamkniętego prostokąta. Użyj stabilnego rozwiązania równania kwadratowego, a dla zera `c2` rozwiązania liniowego. Dla odcinka stycznego kontakt również jest zdarzeniem. Dla granicy planszy rozróżniaj samo dotknięcie dopuszczalnej granicy od rzeczywistego wyjścia na zewnątrz. Bramki mają ustalone x. Wszystkie zdarzenia porządkuj po x; nie sortuj ich według kategorii błędu.

Jeśli nie powstał jeszcze algorytm dokładnego czasu kontaktu, dopuszczalny etap implementacji to statyczny podgląd nieudanego toru z oznaczonym warunkiem. Nie przedstawiaj przybliżonego miejsca zatrzymania jako dowodu działania walidatora.

## 7. Zawartość sześciu misji

| Misja | Umiejętność | Zmieniane parametry | Blokady |
|---|---|---|---|
| M01 | `line_intercept` | wysokość stałej b | `c2=0`, `c1=0`; rodzina `constant` |
| M02 | `line_slope` | a w prostej | `c2=0`, ustalone dla sceny `c0`; rodzina `linear` |
| M03 | `quadratic_vertical_shift` | przesunięcie pionowe q | `c2=0.25`, `c1=0` |
| M04 | `quadratic_horizontal_shift` | przesunięcie poziome p | `c2=0.25`, `vertexLock.y=0` |
| M05 | `quadratic_curvature` | krzywizna a | `c1=0`, `c0=0` |
| M06 | `combine_transformations` | a, p, q razem | brak dodatkowych blokad, rodzina `quadratic` |

Reguły mają stabilne identyfikatory: `RULE_LINE_INTERCEPT`, `RULE_LINE_SLOPE`, `RULE_QUAD_VERTICAL`, `RULE_QUAD_HORIZONTAL`, `RULE_QUAD_CURVATURE`, `RULE_COMBINE`. Ich tekst w słowniku i w misji powinien pozostać zgodny. Tekst własnego wyjaśnienia gracza jest osobnym obiektem od reguły kanonicznej.

Poniższe wzory są materiałem dla implementacji i audytu, nie treścią widoczną podczas samodzielnej próby:

| Misja | practice | teach | robot_transfer | human_check |
|---|---|---|---|---|
| M01 | `1` | `2` | `3` | `-1` |
| M02 | `0.5x` | `-0.5x+3` | `0.25x+1` | `-x+5` |
| M03 | `0.25x²+1` | `0.25x²-1` | `0.25x²+2` | `0.25x²-2` |
| M04 | `0.25(x-1)²` | `0.25(x+1)²` | `0.25(x-2)²` | `0.25(x+2)²` |
| M05 | `0.25x²` | `0.5x²` | `x²` | `0.125x²` |
| M06 | `0.25(x-1)²+1` | `0.5(x+1)²-1` | `0.25(x+2)²+1` | `0.5(x-1)²-2` |

Wszystkie 24 sceny mają dwie bramki, jedną przeszkodę i przejścia o wysokości 0.76 jednostki. Po uwzględnieniu obrysu robota środek może odbiegać od centralnej wysokości przejścia o 0.26. To oznacza, że poprawne mogą być różne pobliskie wzory; nie wymagamy trafienia w środek co do współczynnika.

W początkowych misjach start silnie ogranicza jedyny zmieniany parametr. To celowe wprowadzenie. W późniejszych misjach błędne wzory z poprawnym startem pokazują kolizję, wyjście poza obszar lub pominięcie bramki. Zakresy osi zmieniają się między scenami, więc należy zawsze pokazywać podziałkę i liczby, a nie sugerować stałe znaczenie odległości w pikselach.

## 8. Sprawdzenie liczbowe wyjaśnienia

W każdej scenie `teach` po udanym locie gracz wpisuje dwie wartości swojej funkcji dla x bramek `G1` i `G2`. To krótka kontrola rachunkowa, oddzielna od oceny językowej. Identyfikatory punktów znajdują się w `skills.v1.json`.

Przykładowa odpowiedź może zawierać:

```json
{
  "sceneId": "M01-teach",
  "numericEvidence": [
    {"checkpointId": "G1", "submittedY": 2},
    {"checkpointId": "G2", "submittedY": 2}
  ]
}
```

Serwer pobiera x bramki z własnej wersji sceny i porównuje odpowiedź z wartością **rzeczywiście zatwierdzonego wzoru gracza**, nie z `witness`. Nie ufa x, współczynnikom ani etykiecie sukcesu przysłanym przez klienta. Dla dwóch odpowiedzi liczbowych używa tolerancji bezwzględnej `1e-6`; jest ona celowo odrębna od tolerancji geometrii `1e-9`. Gracz może wpisać kropkę albo polski przecinek dziesiętny.

Wymagany krok to własna próba wyjaśnienia, potwierdzenie reguły kanonicznej i poprawne sprawdzenia liczbowe. LLM nie jest bramką decydującą, czy użytkownik może przejść dalej. Gdy ocena językowa jest niedostępna lub niepewna, interfejs nadal może przedstawić regułę kanoniczną do potwierdzenia. Szczegółowy kontrakt dialogu i ponawiania określa dokument modułu AI.

## 9. Walidacja paczki i kryteria gotowości

Uruchom w katalogu głównym projektu:

```bash
python3 tools/validate_missions.py
python3 tools/validate_missions.py --help
python3 tools/validate_missions.py --json-report artifacts/math-validation.json
```

Można podać inną ścieżkę do pliku `missions.v1.json` jako argument pozycyjny. Pliki `missions.schema.json` i `skills.v1.json` muszą wtedy znajdować się obok niego. Skrypt wymaga Python 3.10 lub nowszego i nie wymaga instalowania pakietów. Jego import nie uruchamia walidacji ani nie zapisuje plików.

Walidator:

1. Sprawdza cały użyty podzbiór schematu JSON, w tym nieznane pola i wymagane wersje.
2. Sprawdza 6 misji, 24 sceny, zgodność ról, identyfikatorów, słownika umiejętności i reguł.
3. Sprawdza położenie startu/mety, kolejność bramek i poprawność prostokątów.
4. Parsuje każdy `witness` i każdy `knownFailure`, porównując rzeczywiste współczynniki z zadeklarowanymi.
5. Wymaga `SUCCESS` dla wszystkich 24 wzorów referencyjnych.
6. Wymaga zadeklarowanej kategorii porażki dla każdego z 37 znanych błędów.
7. Sprawdza, że samodzielna próba ma inną geometrię i wzór kontrolny od transferu robota.
8. Uruchamia kontrolne przypadki parsera i geometrii: minus przed kwadratem, mnożenie niejawne, przecinek, dokładne skracanie współczynników, niedozwolone funkcje, dzielenie przez x/zero, limity, niedomiar float64, wierzchołek wewnątrz przedziału, cienką przeszkodę i kontakt graniczny.

Oczekiwany wynik dołączonej wersji: **6 misji, 24 sceny, 24 poprawne rozwiązania kontrolne, 37 zgodnych znanych błędów i 42 kontrole parsera/geometrii**.

Ten wynik dowodzi spójności materiału matematycznego według opisanych reguł. Nie dowodzi jeszcze poprawności przyszłej implementacji TypeScript, działania API, animacji ani wartości edukacyjnej. Przy budowie aplikacji należy użyć tych samych fixture do testu silnika produkcyjnego, dołożyć kontrolę jego integracji z interfejsem oraz przeprowadzić osobny pilotaż z uczniami.

Po zmianie dowolnej geometrii, wzoru, blokady lub reguły kolizji walidator musi ponownie przejść. Nie aktualizuj oczekiwanych kodów błędów tylko po to, by test stał się zielony: najpierw wyjaśnij zmianę matematycznego wyniku.
