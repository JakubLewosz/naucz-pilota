# Naucz Pilota — specyfikacja produktu
Wersja: 1.0 • język produktu: polski • stan: projekt do implementacji • data: 2026-11-03.

## Obietnica produktu
**Przeprowadź Piko przez tor, ucząc go, jak działają wykresy funkcji. Potem sprawdź, czy potrafisz użyć tej zasady samodzielnie.**

Naucz Pilota jest krótką grą edukacyjną dla uczniów rozpoczynających pracę z funkcją liniową i kwadratową, orientacyjnie 14–19 lat. Gracz zapisuje funkcję, a jej wykres staje się trasą małego robota. Trzeba przejść przez pionowe bramki i uniknąć przeszkód. Robot odgrywa ucznia: popełnia zaplanowane błędy pojęciowe, odpowiada na wyjaśnienia gracza i próbuje użyć zapisanych zasad na nowej planszy.

Nie twierdzimy, że samo rozmawianie z robotem dowodzi opanowania materiału. Dlatego każdą misję zamyka osobne zadanie gracza bez podpowiedzi. Nie obiecujemy poprawy ocen ani naukowo potwierdzonej skuteczności przed przeprowadzeniem odpowiednich badań.

## Decyzja o wyróżniku
Wyróżnikiem jest połączenie trzech rzeczy:
1. Wykres jest bezpośrednio sterowaną trasą w grze.
2. Gracz musi wyjaśnić zasadę postaci i pokazać jej działanie na liczbach.
3. Gra oddziela skuteczność robota od samodzielnego wyniku gracza.

Sam pomysł „uczenia agenta” ani gra z wykresami nie są nowe. Nie używać haseł „pierwsza na świecie” ani „AI naprawdę trenuje się na graczu”. Twórczy wkład projektu to konkretny przebieg gry, scenariusze nieporozumień, powiązanie rozmowy ze sprawdzonymi faktami matematycznymi oraz przejrzyste sprawdzenie transferu.

## Główne potrzeby
- Uczeń: zobaczyć skutek zmiany wzoru i zrozumieć, dlaczego tor się zmienił.
- Osoba oglądająca prezentację: w ciągu minuty zobaczyć rozgrywkę, rolę AI i efekt własnego działania.
- Nauczyciel lub juror: odróżnić edukacyjną treść od dekoracyjnego czatu i sprawdzić wiarygodność wyniku.
- Autor: zdążyć ukończyć i udokumentować mały, spójny produkt.

## Zakres wersji konkursowej
| Obszar | Decyzja |
|---|---|
| Kampania | 6 misji, po 4 różne plansze w każdej |
| Matematyka | Wielomiany stopnia najwyżej 2; proste, stałe i parabole |
| Akcje | Wpisanie wzoru, uruchomienie przejazdu, krótkie wyjaśnienie, dwie prognozy liczbowe, obserwacja próby Piko |
| AI | Jeden symulowany uczeń; polski dialog; propozycja wzoru w scenie transferu |
| Weryfikacja | Wspólny, deterministyczny silnik matematyczny w przeglądarce i na serwerze |
| Zapis | Lokalny postęp na jednym urządzeniu; bez kont |
| Platforma | Aplikacja webowa oraz opakowanie Windows z tym samym interfejsem |
| Offline | Jawnie oznaczona, deterministyczna wersja demonstracyjna |
| Dokumentacja | Kod, instrukcje, testy, scenariusz filmu, materiały zgłoszeniowe do uzupełnienia |
| Czas gry | Cel projektowy: około 30–45 minut całości, do sprawdzenia na użytkownikach |

Cel czasowy nie jest wynikiem badania. Nie przeciągać rozmowy, by osiągnąć zakładany czas.

## Misje
| ID | Umiejętność | Typowe nieporozumienie | Zasada, którą gracz sprawdza |
|---|---|---|---|
| M01 | Wyraz wolny prostej, na początek pozioma y=b | Stała nie zmienia położenia wykresu | Stała zmiana wyrazu wolnego przesuwa cały wykres pionowo |
| M02 | Nachylenie prostej | Dodatni współczynnik poprowadzi prostą w dół | Znak współczynnika przy x określa kierunek zmian y |
| M03 | Przesunięcie paraboli w pionie | Dodatnia stała przesunie parabolę w dół | Dodanie k do całego wyrażenia zmienia wysokość zgodnie ze znakiem k |
| M04 | Przesunięcie paraboli w poziomie | W (x-p)² znak wskazuje kierunek wprost | Wierzchołek postaci a(x-p)²+q ma współrzędne (p,q) |
| M05 | Szerokość paraboli | Większe dodatnie a oznacza szerszą parabolę | Dla dodatniego a, przy tej samej odległości od osi, większe a daje większą wysokość nad wierzchołkiem |
| M06 | Łączenie przekształceń | Parametry można zmieniać bez sprawdzenia całego toru | Wspólnie dobiera się a, p i q, potem sprawdza ograniczenia |

Dokładna geometria i wzory są w content/missions.v1.json. Tabela jest opisem programu; nie zastępuje danych.

## Kryteria sukcesu produktu
Wersja jest funkcjonalnie gotowa, jeśli:
- Można od nowego zapisu ukończyć wszystkie 6 misji w trybie demo.
- Wszystkie sceny mają osiągalne rozwiązanie; błędy kontrolne są rzeczywiście odrzucane.
- W trybie live robot reaguje na treść wyjaśnień oraz proponuje własny wzór.
- Każdy wzór AI jest sprawdzany tak samo jak wzór gracza.
- Błąd AI lub internetu nie zmienia wyniku na sukces i nie usuwa postępu.
- W zadaniu samodzielnym nie ma podpowiedzi przed pierwszym uruchomieniem.
- Pierwszy samodzielny wynik, kolejne próby i pomoc są rozróżnione w zapisie.
- Interfejs da się obsłużyć klawiaturą, bez rozpoznawania samego koloru.
- Pakiet Windows uruchamia się na czystym komputerze bez zainstalowanego Node.
- Instrukcje pozwalają odtworzyć projekt, a raport uczciwie rozdziela testy demo, live i Windows.

## Czego nie dodawać do tej wersji
Nie budować kont, rankingu, płatności, sieciowego multiplayera, czatu głosowego, generowania nieskończonych poziomów, rozpoznawania zdjęć zeszytu, integracji szkolnych ani treningu modelu. Nie dodawać drugiej postaci „AI korepetytora”. Nie powiększać zakresu o trygonometrię, funkcje wymierne i fizykę balistyczną.

Nie jest to gra z dowolnie projektowanymi trasami. Ograniczenie do wielomianów stopnia 2 jest świadome: daje czytelną matematykę, deterministyczne sprawdzenie całego toru i wykonalny projekt.

## Główne ryzyka i decyzje
| Ryzyko | Odpowiedź w projekcie |
|---|---|
| AI jest tylko czatem obok gry | Model dostaje scenę i sprawdzone fakty, reaguje jako uczeń i składa własną propozycję trasy |
| Model zna rozwiązanie od początku | Otwarcie opisujemy symulację początkującego; pamięć to stan gry i kontekst, nie przyrost zdolności bazowego modelu |
| Losowa pomyłka modelu psuje postęp | Porażka Piko jest widoczna; po jednej opcjonalnej poprawce można przejść do zadania własnego |
| Rozmowa zastępuje zabawę | Odpowiedzi krótkie, maksymalnie jedno pytanie naraz; wykres pozostaje głównym elementem |
| Kod wygląda dobrze, ale źle liczy | Analityczne testy toru, sprawdzone dane, scenariusze graniczne |
| Gracz tylko kopiuje gotowy wzór | Nowa scena human_check, bez podglądu trasy i bez AI przed pierwszą próbą |
| Nie zdążymy z publikacją | Najpierw kompletna M01, następnie pozostałe misje, potem paczka Windows i prezentacja |

## Uczciwe komunikaty
W „O projekcie” umieścić: „Piko jest symulowanym uczniem. Model językowy odgrywa jego rolę, a aplikacja zapisuje sprawdzone zasady w pamięci sesji. Nie trenujemy modelu na rozmowie. Trafienia, przeszkody i zaliczenia oblicza silnik matematyczny.”

Wynik „samodzielnie” dotyczy konkretnego zadania w aplikacji. Nie jest diagnozą poziomu ucznia ani dowodem długotrwałego nauczenia się materiału.
