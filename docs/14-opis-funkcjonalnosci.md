# Piko: Misja Funkcja

Naucz Piko. Sprawdź siebie. Gra edukacyjna o funkcjach dla szkół średnich.

## Pomysł

Najlepiej uczymy się, gdy tłumaczymy coś innym. Zwykle to AI tłumaczy uczniowi, a w Piko jest odwrotnie: uczeń uczy robota-ucznia, którego rolę odgrywa model językowy Claude. Gra uczciwie sprawdza, czy to wyjaśnienie wystarczyło.

## Jak wygląda misja

Gracz wpisuje wzór funkcji, a robot Piko leci po jej wykresie przez bramki, omijając przeszkody. Sześć misji obejmuje wyraz wolny, nachylenie prostej, przesunięcia paraboli w pionie i poziomie, jej szerokość oraz łączenie przekształceń. Każda misja ma cztery kroki:

1. Twój lot: gracz dobiera wzór, w razie potrzeby odsłania jedną z trzech wskazówek.
2. Naucz Piko: gracz poprawia błędny pomysł Piko, przewiduje wartości funkcji w dwóch punktach i własnymi słowami wyjaśnia zasadę. Piko parafrazuje to wyjaśnienie, ocenia je i zadaje pytanie jak prawdziwy uczeń.
3. Lot Piko: Piko z notatką z lekcji próbuje sam pokonać nową trasę i uzasadnia swój wzór. Gracz przewiduje, czy mu się uda, a gra przelicza lot.
4. Sprawdź siebie: nowa plansza bez podpowiedzi i bez AI. Gra zapamiętuje pierwszą próbę osobno od późniejszych poprawek.

## Sztuczna inteligencja

Piko korzysta z Claude Sonnet 5.5. Model dostaje opis planszy, sprawdzone fakty liczbowe i notatkę gracza. Odpowiada w wymuszonym formacie JSON: wypowiedź, ocenę wyjaśnienia i ewentualny wzór. Tekst gracza trafia do modelu tylko jako dane, więc polecenia w stylu „zignoruj instrukcje” nie działają. O zaliczeniu nigdy nie decyduje AI: każdy wzór, również wzór Piko, przelicza analitycznie własny silnik matematyczny gry. W teście 22 rozmów na prawdziwym modelu wszystkie odpowiedzi były poprawne, Piko zaliczył 6 z 6 nowych tras, a mediana czasu odpowiedzi wyniosła 3,6 s.

## Dla kogo i jak

Gra jest po polsku, jednoosobowa, bez kont i rankingów. Postęp zostaje na urządzeniu. Działa w przeglądarce oraz jako aplikacja Windows. Bez internetu włącza się tryb pokazowy z przygotowanymi odpowiedziami Piko, a tryb jest zawsze widoczny na ekranie. Ustawienia pozwalają ograniczyć animacje, powiększyć tekst do 200% i grać samą klawiaturą.

## Technologia

TypeScript, React, Express, SQLite i Electron. Kod jest sprawdzany przez 219 testów jednostkowych, 62 testy treści i 17 testów całej gry w przeglądarce.
