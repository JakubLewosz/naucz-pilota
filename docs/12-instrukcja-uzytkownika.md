# Instrukcja użytkownika

Piko: Misja Funkcja 1.0.0. Napisz funkcję, wyznacz bezpieczny tor i naucz Piko, dlaczego działa.

## Rozpoczęcie

Wybierz Rozpocznij albo Kontynuuj. Lista misji pokazuje sześć tematów i kolejność odblokowania. W górnym pasku zawsze widzisz tryb: Demo oznacza przygotowane odpowiedzi; Live oznacza prawdziwy model; AI niedostępne oznacza brak odpowiedzi. Model może się pomylić. Zaliczenia liczy aplikacja.

Na planszy x rośnie w prawo, y w górę. S oznacza start, G1 i G2 bramki, CEL metę. Kreskowany prostokąt jest przeszkodą. Robot ma bok 0,24 jednostki i cały musi mieścić się w otworach. W Danych planszy znajdziesz dokładne współrzędne. Pod wykresem przez cały czas widać wymagane blokady parametrów.

## Cztery etapy misji

1. Twój lot: wpisz wzór i naciśnij Leć. Przerywana linia jest neutralnym podglądem. Wynik pojawia się po uruchomieniu. W razie trudności odsłaniaj kolejno trzy wskazówki. Po bezpiecznym locie wybierz Teraz naucz Piko.
2. Naucz Piko: sprawdź jego scenariuszowy pomysł, popraw wzór, przewidź y dla x obu bramek i wyjaśnij zmianę. Przycisk Sprawdź naprawę przelicza tor i prognozy. W live przycisk Powiedz Piko pozwala otrzymać parafrazę i opinię o tekście. Demo pokazuje przygotowany komentarz. Po kontroli wzoru i prognoz wybierz Zapisz notatkę dla Piko. Odpowiedź Piko jest opcjonalna.
3. Lot Piko: robot dostaje nową planszę, notatkę i sprawdzoną zasadę. Poproś o propozycję, przeczytaj komentarz i przewidź wynik. Po wybraniu „Sprawdź lot Piko” zobaczysz sprawdzony wzór i wynik silnika. Rozwiń „Dlaczego? Wartości obliczone przez silnik”, aby odczytać wysokości w punktach trasy. Możesz poprosić o jedną poprawkę. W czasie oczekiwania możesz przejść do własnej próby przyciskiem „Pomiń lot Piko”. Notatka pozostanie zapisana, a pominięcie będzie odnotowane oddzielnie od Twojego wyniku. Gdy AI jest niedostępne, możesz jawnie wybrać demo.
4. Sprawdź siebie: to kolejna, osobna plansza. Przed pierwszą próbą nie ma toru, automatycznych wartości y, rozmowy, wskazówek ani dziennika. Wpisz wzór i wybierz Sprawdź mój lot. Błąd składni nie liczy się jako próba. Pierwszy parsowalny wzór i jego wynik są niezmiennie zachowane. Po porażce możesz poprawiać wzór; podsumowanie rozróżnia pierwszą próbę i późniejsze ukończenie.

## Zapis wzoru

Dozwolone są liczby, x, +, -, *, / przez stałą, nawiasy i potęgi 0, 1, 2. Przykłady składni: 2x+1; 0,5x; 0.25(x-2)^2+1; (x+1)(x-1). To przykłady języka, a nie odpowiedzi do aktualnej misji. Możesz dopisać y= lub f(x)=. Funkcje sin i sqrt, dzielenie przez x oraz stopień 3 są niedozwolone. -x^2 oznacza ujemny kwadrat, a (-x)^2 dodatni kwadrat. 1/2x znaczy (1/2)*x.

## Sterowanie i czytelność

Tab przechodzi między polami i przyciskami. Enter w polu wzoru uruchamia lot; Enter w wyjaśnieniu tworzy nową linię. Przyciski aktywujesz Enter lub spacją. Escape zamyka pomoc, dziennik i ustawienia, zachowując wpisy. Pokaż wynik pomija animację. W Ustawieniach włącz ograniczenie ruchu, obrys robota albo większy tekst. Preferencja ograniczonego ruchu z systemu też jest respektowana. Wyniki mają tekst i symbole, a nie sam kolor.

## Postęp i dane

Postęp zapisuje się lokalnie na urządzeniu. Zmiana przeglądarki/profilu lub usunięcie danych przeglądarki może go usunąć. Powtórzenie ukończonej misji archiwizuje poprzednie podejście; podsumowanie pozwala je rozwinąć. Samo odświeżenie nie resetuje pierwszej próby. Dziennik pokazuje zasadę danej misji od jej pierwszej parsowalnej próby. Dotyczy to także wejścia przez inną misję i podsumowania kampanii. W powtórce zasada tej samej misji jest ponownie ukryta do pierwszej próby. Zapis poprzedniego podejścia pozostaje w archiwum. Otwarty dziennik oznacza przegląd wyłącznie przy wyświetlonych zasadach.

Wyczyść rozmowę usuwa wiadomości tej lekcji z widoku i aktywnej sesji serwera. Wyniki i zapisane notatki pozostają w zapisie gry. Usuń lokalny postęp usuwa bieżący zapis na urządzeniu po potwierdzeniu.

Aplikacja przenosi zapisy wersji 1 do wersji 2. Ekran odzyskiwania pozwala zachować kopię uszkodzonego lub nieznanego zapisu przed rozpoczęciem nowego. Gdy pamięć urządzenia odrzuca zapis, bieżący postęp pozostaje w otwartej karcie.

W live do usługi AI trafia Twoje wyjaśnienie, notatka, bieżąca plansza i potrzebne reguły. Serwer gry przechowuje bieżącą rozmowę w sesji SQLite, która wygasa po 24 godzinach. Wyczyść rozmowę działa na serwerze gry. Dane wysłane do dostawcy podlegają ustawieniom konta API. W demo odpowiedzi są scenariuszowe i działają lokalnie.

Piko odgrywa ucznia; nie trenujemy wag modelu. Wyniki opisują wykonanie zadań w tej sesji. Nie są diagnozą wiedzy ani dowodem trwałej skuteczności edukacyjnej.

## Dostęp do live z kodem

Jeżeli prowadzący przekazał Ci kod, otwórz Ustawienia, rozwiń „Masz kod dostępu do live?”, wpisz go i wybierz „Połącz z kodem”. Po potwierdzeniu wróć do gry. Kod trzeba podać ponownie po zamknięciu aplikacji lub odświeżeniu strony. Jeśli prowadzący używa dostępu z określonej sieci, postępuj według jego instrukcji.
