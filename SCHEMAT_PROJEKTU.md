# Naucz Pilota — cały schemat projektu

## Decyzja
Budujemy krótką grę o funkcjach, w której gracz jest nauczycielem robota Piko. Zachowujemy pierwotny pomysł: wpisujesz wzór, jego wykres staje się trasą, a robot musi przejść przez bramki i ominąć przeszkody.

Główny pomysł na AI: Piko odgrywa początkującego. Pokazuje typowe nieporozumienie, reaguje na Twoje wyjaśnienie i później sam proponuje wzór na inną planszę. Ty sprawdzasz jego pomysł, a na końcu rozwiązujesz własne nowe zadanie.

**Hasło: „Napisz funkcję. Wyznacz bezpieczny tor. Naucz Piko, dlaczego działa.”**

Adresat: uczeń poznający funkcję liniową i kwadratową, orientacyjnie 14–19 lat. Język: polski. Zakres: 6 misji, 24 przygotowane plansze, jednoosobowa rozgrywka. Orientacyjny cel długości całości to 30–45 minut; rzeczywisty czas trzeba sprawdzić.

## 1. Jak wygląda jedna misja
### Krok A — sam sprawdzasz tor
Na ekranie widzisz układ współrzędnych, start, dwie bramki, cel i przeszkody. Wpisujesz funkcję. Widzisz neutralny podgląd, a po „Leć” Piko jedzie po wykresie. Gra pokazuje miejsce porażki i konkretny powód.

Przykład: tor jest za wysoko. Zmieniasz stałą we wzorze i oglądasz przesunięcie. Masz do dyspozycji trzy krótkie wskazówki dotyczące tej umiejętności.

### Krok B — uczysz Piko
Dostajesz inną planszę. Robot przedstawia przygotowane nieporozumienie, np. odwrotnie rozumie znak przesunięcia paraboli. Sprawdzasz jego wzór, poprawiasz go i piszesz jedno lub dwa zdania wyjaśnienia.

Dodatkowo przewidujesz dwie wartości y dla wskazanych x. Gra oblicza je niezależnie i sprawdza, czy Twój wzór rzeczywiście działa. AI może dopytać, ale jego ocena tekstu nie rozstrzyga zaliczenia.

Po poprawnym sprawdzeniu widzisz krótką, prawidłową regułę i zapisujesz ją w dzienniku Piko. Zatwierdzasz zasadę kanoniczną przygotowaną przez autora, nie przypadkowe zdanie modelu.

### Krok C — Piko próbuje sam
Robot dostaje nową geometrię i zapisane zasady, bez rozwiązania referencyjnego. Prawdziwy model proponuje funkcję. Zanim zobaczysz wynik, możesz wybrać „Przeleci”, „Nie przeleci” lub „Jeszcze nie wiem”.

Silnik sprawdza propozycję. Jeżeli Piko się pomyli, widzisz jego rzeczywisty błąd. Możesz pozwolić mu na jedną poprawkę albo przejść dalej. Wygrana robota nie jest wymagana do kontynuacji.

### Krok D — Twój samodzielny lot
Dostajesz czwartą, wcześniej niepokazaną planszę. Nie ma AI, wskazówek, dziennika ani podglądu toru przed pierwszym zatwierdzeniem. Musisz przewidzieć efekt wzoru.

Pierwszy wynik pozostaje zapisany. Po porażce możesz poprawiać odpowiedź, ale późniejszy sukces jest odróżniony od pierwszej próby. Dzięki temu aplikacja pokazuje, co zrobiłeś sam, zamiast utożsamiać Twój wynik ze skutecznością robota.

## 2. Sześć misji
| Misja | Co ćwiczy | Przykładowy błąd Piko |
|---|---|---|
| Wysokość lotu | Wyraz wolny; na początek pozioma y=b | „Liczba bez x nie zmieni wysokości” |
| Kierunek i nachylenie | Znak i wartość współczynnika prostej | Dodatni współczynnik zastosowany do lotu w dół |
| Parabola w pionie | Przesunięcie całego wykresu w górę lub w dół | Odwrócony znak przesunięcia |
| Parabola w poziomie | Położenie wierzchołka w a(x-p)²+q | Nawias x-1 odczytany jako przesunięcie w lewo |
| Szerokość paraboli | Wpływ dodatniego a | Większe a uznane za szerszą parabolę |
| Połącz reguły | Wspólne dobranie kształtu i położenia | Poprawny wierzchołek bez sprawdzenia reszty toru |

Rzeczywiste plansze są już zapisane w JSON. To nie są tylko tytuły poziomów: każda ma geometrię, ograniczenia, początkowy wzór, rozwiązanie kontrolne i przykłady błędów.

## 3. Konkretny przykład M04
W części teach Piko ma przesunąć parabolę w lewo. Zaczyna od:
    f(x) = 0.25(x-1)^2

To jego przygotowana pomyłka. Rozwiązanie kontrolne tej planszy:
    f(x) = 0.25(x+1)^2

Gracz tłumaczy, że nawias zeruje się dla x=-1, więc wierzchołek jest po lewej. Sprawdza też dwie wartości w bramkach. Piko odpowiada własnymi słowami, a aplikacja pozwala zapisać regułę o współrzędnej wierzchołka.

W robot_transfer plansza wymaga innego położenia i model sam proponuje wzór. W human_check gracz ma jeszcze inną planszę. Rozwiązania tych scen nie są prezentowane jako podpowiedź do sprawdzianu.

To dobry fragment do filmu: zmiana znaku w nawiasie ma natychmiast widoczny efekt, łatwo pokazać pomyłkę i jej wyjaśnienie.

## 4. Co robi AI
AI:
- odgrywa Piko po polsku;
- odnosi się do konkretnego wyjaśnienia gracza;
- zadaje najwyżej jedno krótkie pytanie naraz;
- korzysta z zapisanych zasad;
- proponuje własną funkcję w transferze;
- potrafi ujawnić niepewność albo popełnić widoczny błąd.

Program:
- parsuje wzór;
- oblicza liczby, trafienia i kolizje;
- sprawdza dwie prognozy;
- zapisuje kanoniczne reguły i postęp;
- odróżnia pierwszą próbę od poprawionych;
- kontroluje, jaka część sceny trafia do modelu.

Nie trenujemy modelu. Jego „nauka” jest symulacją opartą na roli i pamięci aplikacji. Projekt powinien otwarcie to wyjaśniać. Nasza oryginalność leży w przebiegu i jakości gry; nie twierdzimy, że jako pierwsi wymyśliliśmy gry z wykresami lub uczonego agenta.

## 5. Jak wygląda aplikacja
Jasny, czytelny panel. Plansza po lewej zajmuje większość ekranu; po prawej krótka rozmowa i cel etapu. Pole wzoru znajduje się bezpośrednio pod wykresem.

Piko jest prostym zaokrąglonym kwadratem z oczami, wykonanym w SVG. Bramki są oznaczone G1 i G2, przeszkody mają kreskowanie. Wynik używa tekstu i ikony, nie tylko zielonego lub czerwonego koloru.

Ekrany: start, lista sześciu misji, rozgrywka, dziennik zasad, podsumowanie misji i całej gry, ustawienia. Na telefonie panele ustawiają się jeden pod drugim. Podstawowe akcje działają klawiaturą.

Trzy widoczne stany AI:
- live — odpowiedź rzeczywiście pochodzi z modelu;
- demo — przygotowana demonstracja bez połączenia;
- unavailable — brak odpowiedzi, możliwość ponowienia lub jawnego wyboru demo.

Błąd sieci nie kasuje wpisanego wzoru i nie zamienia się po cichu w udawaną odpowiedź AI.

## 6. Technologia
| Element | Wybór i powód |
|---|---|
| Interfejs | React + TypeScript + Vite; wygodna aplikacja webowa i wspólny kod desktopu |
| Wykres | SVG; czytelne, skalowalne elementy i łatwa animacja |
| Matematyka | Własny mały moduł TypeScript; tylko wielomiany stopnia 0–2, pełne sprawdzenie toru |
| AI | Mały backend Node/Express, oficjalny SDK i odpowiedzi według JSON Schema |
| Postęp | Wersjonowany lokalny zapis, bez kont |
| Desktop | Electron z lokalnie spakowanym interfejsem |
| Testy | Vitest i Playwright; osobne sprawdzenie live i Windows |

Przy takim zakresie można policzyć kolizje analitycznie. Nie rozstrzygamy ich na podstawie pikseli ani kilku próbek wykresu. Kwadratowy rozmiar robota jest częścią obliczeń.

Klucz AI znajduje się wyłącznie na backendzie. Wersja .exe nie może go zawierać. Jury otrzyma aplikację połączoną z przygotowanym serwerem, a przy braku internetu dostępne będzie jawne demo. Uruchomienie backendu na hostingu pozostaje osobnym krokiem właściciela projektu.

## 7. Co budować w jakiej kolejności
1. Szkielet aplikacji i bezpieczny silnik matematyczny.
2. Jedna kompletna misja M01 z czterema etapami i lokalnym demo.
3. Rzeczywiste AI wraz z obsługą błędów i limitami.
4. Wszystkie sześć misji przez wspólne komponenty.
5. Dopracowanie interfejsu i próby z kilkoma użytkownikami.
6. Wydanie Windows, instrukcje, film i materiały konkursowe.

Nie zaczynać od rozbudowanej strony startowej, animacji 3D lub kont. Pierwszy wartościowy rezultat to jedna misja, którą da się rzeczywiście przejść.

Zakres nie obejmuje multiplayera, rankingu, głosu, generowania poziomów na żądanie, zdjęć zeszytu i treningu modelu. Te dodatki nie są potrzebne do zaprezentowania głównego pomysłu.

## 8. Dlaczego ten kształt pasuje do konkursu
Projekt daje konkretną treść edukacyjną, rolę AI widoczną w rozgrywce, czytelny interfejs, sprawdzalną matematykę oraz łatwy do pokazania przebieg. To odpowiada pięciu opublikowanym obszarom oceny. Nie daje gwarancji nagrody; wynik zależy od wykonania i oceny jury.

Strona organizatora: https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas
Termin wskazany przy przygotowaniu paczki: 29 listopada 2026. Plan zakłada gotowość materiałów 26–27 listopada, aby zachować zapas.

W pakiecie są instrukcje przygotowania kodu, binarnej aplikacji, instrukcji, opisu i filmu. Autor nadal musi zapewnić własne dane i podpisy, przetestować wydanie oraz faktycznie wysłać zgłoszenie.

## 9. Co jest już gotowe w tej paczce
- Decyzje produktowe i szczegółowy przebieg gry.
- Specyfikacja ekranów, komunikatów i dostępności.
- 24 plansze z poprawnymi rozwiązaniami kontrolnymi.
- 37 sprawdzonych błędnych przykładów.
- 18 przygotowanych wskazówek.
- Parser i geometria opisane szczegółowo, z działającym walidatorem danych w Pythonie.
- Kontrakt API, system prompt i zasady pamięci.
- 42 zaplanowane przypadki weryfikacji AI oraz integracji.
- Kolejność implementacji, warunki odbioru i plan konkursowy.
- AGENTS.md i gotowy prompt startowy.

Nie zbudowano jeszcze aplikacji React/Express/Electron, nie wykonano płatnych wywołań AI i nie nagrano filmu. Wyniki kontroli danych nie zastępują testów gotowej gry.

## 10. Jak przekazać wszystko Codexowi
Rozpakuj ZIP do nowego folderu. Otwórz ten folder w Codex i wklej START_CODEX.md. Resztę kontekstu Codex ma przeczytać z plików. Po każdym etapie patrz przede wszystkim na działające zachowanie i raport, a nie samo stwierdzenie „gotowe”.

Jeżeli praca wymaga nowej sesji, poleć przeczytać AGENTS.md i IMPLEMENTATION_STATUS.md oraz kontynuować. Pełny stan ma pozostać w repozytorium, żeby nie budować aplikacji od nowa przy każdej rozmowie.

Materiały są wystarczająco konkretne, aby rozpocząć implementację. Najważniejsze pierwsze zadanie to M01 od startu do samodzielnego lotu — wtedy od razu widać, czy cały pomysł działa jako gra.
