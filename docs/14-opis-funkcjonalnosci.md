# Piko: Misja Funkcja

Naucz Piko. Sprawdź siebie. Gra edukacyjna o funkcjach dla szkół średnich.

## Pomysł

Najlepiej uczymy się, gdy tłumaczymy coś innym. Zwykle to AI tłumaczy uczniowi, a w Piko jest odwrotnie: uczeń uczy robota-ucznia, którego rolę odgrywa model językowy Claude. Piko naprawdę uczy się tylko od gracza: jeśli nauczysz go źle, poleci źle, a Ty musisz znaleźć i poprawić błąd we własnym rozumowaniu.

## Jak wygląda misja

Gracz wpisuje wzór funkcji, a robot Piko leci po jej wykresie przez bramki, omijając przeszkody. Sześć misji obejmuje wyraz wolny, nachylenie prostej, przesunięcia paraboli w pionie i poziomie, jej szerokość oraz łączenie przekształceń. Każda misja ma cztery kroki:

1. Twój lot: gracz dobiera wzór, w razie potrzeby odsłania jedną z trzech wskazówek.
2. Naucz Piko: gracz widzi, jak kończy się błędny pomysł Piko, poprawia jego wzór i własnymi słowami wyjaśnia zasadę. Piko parafrazuje wyjaśnienie, zadaje pytanie jak prawdziwy uczeń i zapisuje w pamięci, co zrozumiał (nawet jeśli to błąd).
3. Lot Piko: Piko zna tylko swoją pamięć z lekcji, bez gotowej zasady. Sam dobiera wzór dla nowej trasy i mówi, które zdanie lekcji stosuje. Gracz przewiduje wynik, a gra przelicza lot. Po porażce gracz poprawia lekcję i Piko próbuje znowu.
4. Sprawdź siebie: nowa plansza bez podpowiedzi i bez AI. Gra zapamiętuje pierwszą próbę osobno od późniejszych poprawek.

## Sztuczna inteligencja

Piko korzysta z Claude Sonnet 5.5. W lekcji model dostaje opis planszy, sprawdzone fakty liczbowe i słowa gracza. W locie dostaje wyłącznie notatki z lekcji. Odpowiada w wymuszonym formacie JSON: wypowiedź, ocenę wyjaśnienia, przekonanie Piko i ewentualny wzór. Tekst gracza trafia do modelu tylko jako dane, więc polecenia w stylu „zignoruj instrukcje” nie działają. O zaliczeniu nigdy nie decyduje AI: każdy wzór, również wzór Piko, przelicza analitycznie własny silnik matematyczny gry. W testach na prawdziwym modelu wszystkie 22 odpowiedzi były poprawne, a lot Piko zależał od lekcji: dobra prowadziła do sukcesu, błędna do rozbicia w przewidywalny sposób.

## Dla kogo i jak

Gra jest po polsku, jednoosobowa, bez kont i rankingów. Postęp zostaje na urządzeniu. Działa w przeglądarce oraz jako aplikacja Windows z wbudowanym połączeniem z Claude, bez zakładania kont i wpisywania kluczy. Bez internetu włącza się tryb pokazowy z przygotowanymi odpowiedziami Piko, a tryb jest zawsze widoczny na ekranie. Ustawienia pozwalają ograniczyć animacje, powiększyć tekst do 200% i grać samą klawiaturą.

## Technologia

TypeScript, React, Express, SQLite i Electron. Kod jest sprawdzany przez 223 testy jednostkowe, 62 testy treści i 17 testów całej gry w przeglądarce.
