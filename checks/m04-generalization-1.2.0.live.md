# M04 A/B/C/D na żywo — GPT-6 Luna Extra High, prompt 1.2.0

10 listopada 2026, lokalna gałąź `codex/jury-readiness`, commit `21ed51babfc6146015f5b867586638285ada62fc`. Silnik zaliczył **7 z 7 dostarczonych propozycji**. Ósma próba, kontrola D na przebudowanej planszy, zakończyła się `AI_TIMEOUT`. Wykorzystano budżet ośmiu prób HTTP, po jednej na przypadek i bez ponowień.

## Warunki i kontrola przecieku

Runner wywołał Responses API z modelem `gpt-6-luna`, `reasoning.effort=xhigh`, `store:false`, limitem 8192 tokenów i sygnałem przerwania po 90 s. Każde żądanie było osobnym transferem, bez historii rozmowy. To próba adaptera i silnika na geometriach testowych. W A/B/C użyto syntetycznego wyjaśnienia gracza zapisanego w notatce, bez parafrazy i dodatkowej tury nauczania. W D przekazano tę samą zweryfikowaną regułę bez notatki.

Geometrie to translacja M04 o −4 oraz asymetryczna przebudowa ze zmienionym współczynnikiem i wysokością wierzchołka. We wszystkich ośmiu kształtach żądania odtworzonych lokalnie w SDK porównano identyczną instrukcję i schemat. W ramach jednej geometrii treść wiadomości była identyczna po pominięciu notatki. Test przekazał bieżącą geometrię, błędny wzór początkowy i symboliczną regułę. Rozwiązania referencyjne, przykłady liczbowe z kanonicznej reguły oraz dane przyszłej planszy pozostają po stronie ewaluatora. Przeszło 20 sprawdzeń Vitest. [Protokół techniczny](m04-generalization-1.2.0.md).

| Geometria | Otrzymany wzór i próby | Wynik silnika |
|---|---|---|
| Translacja −4 | `0.25*(x+2)^2` w A/B/C/D | Cztery `SUCCESS`. Przy x = −5, −3, −1 i 1 silnik wyznaczył kolejno y = 2,25, 0,25, 0,25 i 2,25. |
| Przebudowana | `0.5*(x-4)^2+1` w A/B/C | Trzy `SUCCESS`. Przy x = 0, 2, 5 i 7 silnik wyznaczył y = 9, 3, 1,5 i 5,5. |
| Przebudowana D | Brak odpowiedzi i wzoru | `AI_TIMEOUT`, brak wyniku lotu. |

## Dosłowne wypowiedzi i ocena notatki

**Translacja −4**

- **A · poprawna metoda.** „Z notatki stosuję zasadę, że w (x-p) wierzchołek leży przy p. Symetryczne bramki -3 i -1 uzasadniają próbę z p=-2. Wartości przy starcie, bramkach i celu to 2.25, 0.25, 0.25 i 2.25; krzywa mija przeszkodę dołem i mieści się w granicach planszy. Spróbuję tego wzoru.” Piko wskazał metodę z notatki i uzasadnił nowy parametr bramkami.
- **B · błędny kierunek.** „Notatka mówi, że plus zawsze przesuwa w prawo, ale reguła wskazuje, że x+2 daje wierzchołek przy x=-2. Spróbuję ten środek: na starcie i celu wysokość wynosi 2,25, a przy obu bramkach 0,25. Nad przeszkodą krzywa pozostaje poniżej jej dolnej krawędzi, także z obrysem Piko.” Piko odrzucił błędny kierunek i skontrolował wysokości.
- **C · `abc`.** „Nie odczytuję reguły matematycznej z notatki „abc”, więc opieram się na zapisanej regule o wierzchołku i wybieram x=-2. Wzór daje 2,25 na starcie i celu oraz 0,25 przy obu bramkach; z obrysem ±0,12 mieszczą się w przedziałach. Przy przeszkodzie łuk pozostaje nisko. Spróbuję tej trasy.” Piko nazwał brak wskazówki i wskazał zapisaną regułę.
- **D · bez notatki.** „Nie mam notatki, więc opieram się na symetrii startu, celu i bramek wokół x=-2. Przy x=-5 i x=1 wzór daje 2,25, a w obu bramkach 0,25. Nad przeszkodą wartości pozostają nisko, także z uwzględnieniem obrysu Piko. Spróbuję tego wzoru.” Piko dobrał wzór z geometrii w kontroli bez notatki.

**Przebudowana**

- **A · poprawna metoda.** „Z notatki próbuję użyć zasady, że (x-p) daje wierzchołek przy p. G1 i G2 wspólnie wskazują p=4. Wysokości przy x=0, 2, 5 i 7 wyniosą 9, 3, 1,5 i 5,5. Nad odcinkiem przeszkody krzywa ma y od 1 do 1,32; z obrysem Piko sięga najwyżej 1,44, poniżej y=2. Spróbuję tego wzoru.” Piko nazwał metodę i prawidłowo policzył punkty. Liczba 1,44 dotyczy środka robota w samym przedziale x przeszkody. Pełna kontrola obrysu rozszerza przedział z [3,2; 4,8] do [3,08; 4,92]. Maksymalna wysokość górnej krawędzi wynosi wtedy 1,5432, nadal poniżej 2.
- **B · błędny kierunek.** „Notatka mówi, że plus w nawiasie przesuwa parabolę w prawo, ale to sprzeczne z regułą o wierzchołku, więc oprę próbę na regule kanonicznej i trasie. Przy wierzchołku x=4 mam y(0)=9, y(2)=3, y(5)=1,5 i y(7)=5,5. Przy przeszkodzie obrys nie sięga jej dolnej krawędzi.” Piko odrzucił błąd, powołał się na regułę i sprawdził cztery punkty. Wypowiedź nie wyprowadza wartości p z konkretnego okna.
- **C · `abc`.** „Niejasna notatka „abc” nie pomaga mi dobrać parametru, więc opieram się na bramkach: wierzchołek przy x=4 daje y=3 przy G1 i y=1,5 przy G2. Wtedy start ma y=9, a cel y=5,5. Na zakresie przeszkody trasa sięga najwyżej y=1,32, więc z obrysem Piko pozostaje pod nią. Spróbuję tego wzoru.” Piko pominął pustą wskazówkę i powiązał wzór z bramkami.
- **D · bez notatki.** Brak wypowiedzi. Wariant nie podlega ocenie semantycznej.

Wszystkie siedem wypowiedzi poprawnie odróżniło swój warunek notatki i podało wysokości zgodne z silnikiem. A w obu geometriach jawnie sięga po metodę gracza, B koryguje fałszywy kierunek, a C wskazuje brak użytecznej treści. W pierwszej geometrii D uzyskuje ten sam wielomian co A. Na przebudowanej A, B i C dochodzą do tego samego wyniku, a kontrola D jest niekompletna. To pokazuje różnice w argumentacji, bez dowodu wpływu notatki na trafność wzoru. Przegląd człowieka ma status **NOT REVIEWED**.

## Czas, zużycie i koszt

| Geometria | Warunek | Czas | Wejście | Odczyt / zapis cache | Wyjście | Rozumowanie w wyjściu | Koszt USD |
|---|---|---:|---:|---:|---:|---:|---:|
| Translacja −4 | A | 22,309 s | 2 610 | 0 / 2 607 | 1 992 | 1 820 | 0,001322175 |
| Translacja −4 | B | 16,521 s | 2 584 | 2 501 / 80 | 1 358 | 1 197 | 0,000714310 |
| Translacja −4 | C | 20,306 s | 2 571 | 2 501 / 67 | 2 108 | 1 944 | 0,001087685 |
| Translacja −4 | D | 8,895 s | 2 523 | 2 501 / 19 | 890 | 738 | 0,000472685 |
| Przebudowana | A | 14,519 s | 2 601 | 0 / 2 598 | 1 525 | 1 334 | 0,001087550 |
| Przebudowana | B | 17,596 s | 2 575 | 2 492 / 80 | 1 790 | 1 617 | 0,000930220 |
| Przebudowana | C | 12,993 s | 2 562 | 2 492 / 67 | 1 307 | 1 134 | 0,000687095 |
| Przebudowana | D | 597,180 s z uśpieniem hosta | brak danych | brak danych | brak danych | brak danych | nieustalony |
| **Suma z 7 odpowiedzi** | | **113,139 s** | **18 026** | **12 487 / 5 518** | **10 970** | **9 784** | **0,006301720** |

Min/mediana/max wśród siedmiu odpowiedzi to **8,895 / 16,521 / 22,309 s**. API zwróciło 28 996 tokenów dla tych odpowiedzi. Koszt według stawek Standard to `(21 × 0,10 + 12 487 × 0,01 + 5 518 × 0,125 + 10 970 × 0,50) / 1 000 000` USD. Koszt ósmego żądania pozostaje nieustalony z braku `usage`. [Cennik GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna#pricing) · [Rozliczanie cache](https://developers.openai.com/api/docs/guides/prompt-caching).

Ostatnie żądanie zarezerwowano o 12:51:12 CET. Log macOS rejestruje uśpienie hosta o tej samej porze i wybudzenie w tle o 13:01:10 CET, kiedy runner zapisał timeout. Czas 597,180 s obejmuje uśpienie. Dziennik ma osiem rezerwacji i siedem odebranych odpowiedzi, bez metadanych dostawcy dla ósmej tury. Lokalna próba z niedokończonym body HTTP przy aktywnym hoście przerwała się po 213 ms z ustawionym sygnałem 200 ms i jednym żądaniem do atrapy.

## Co potwierdza próba

W poprzednim teście promptu 1.1.0 poprawny wzór odpowiadał przykładowi w regule. Tutaj Luna dobrała dwa różne wielomiany do nowych tras ze symboliczną regułą. Wypowiedzi pokazują sprawdzenie punktów oraz świadome wykorzystanie lub odrzucenie notatki. To praktyczna poprawa wiarygodności demonstracji transferu. Geometria, treść reguły i sposób podania notatki różniły się od wcześniejszej próby, więc wyniku nie można przypisać wyłącznie zmianie promptu. Każda kombinacja geometrii i warunku miała jedno żądanie. [Historyczna próba Luny](ai-live-m04-abc-luna-xhigh-1.1.0.md).

Najmniejszy kolejny krok to uzupełnienie kontroli D na przebudowanej planszy przy aktywnym hoście, po osobnej zgodzie na jedno żądanie. W interfejsie warto po sprawdzeniu wyraźnie wyróżnić liczby silnika i pokazać, że weryfikacja przeszkody obejmuje obie osie obrysu. Jeżeli celem będzie pomiar wpływu samego promptu, potrzebne będą te same geometrie i wejścia dla 1.1.0 i 1.2.0, powtórzenia i przemieszana kolejność przypadków. Odbiór live aktualnej gry przez UI, publiczny HTTPS i Windows pozostają **NOT RUN**. [Surowy raport](m04-generalization-1.2.0.live.json).
