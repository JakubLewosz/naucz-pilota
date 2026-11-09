# Instrukcja użytkownika

Naucz Pilota 1.0.0. Napisz funkcję, wyznacz bezpieczny tor i naucz Piko, dlaczego działa.

## Rozpoczęcie

Wybierz Zacznij albo Kontynuuj. Lista misji pokazuje sześć tematów i kolejność odblokowania. W górnym pasku zawsze widzisz tryb: Demo oznacza przygotowane odpowiedzi; Live oznacza prawdziwy model; AI niedostępne oznacza brak odpowiedzi. Model może się pomylić. Zaliczenia liczy aplikacja.

Na planszy x rośnie w prawo, y w górę. S oznacza start, G1 i G2 bramki, CEL metę. Kreskowany prostokąt jest przeszkodą. Robot ma bok 0,24 jednostki i cały musi mieścić się w otworach. W Danych planszy znajdziesz dokładne współrzędne. Pod wykresem przez cały czas widać wymagane blokady parametrów.

## Cztery etapy misji

1. Sprawdź tor: wpisz wzór i naciśnij Leć. Przerywana linia jest neutralnym podglądem. Wynik pojawia się po uruchomieniu. W razie trudności odsłaniaj kolejno trzy wskazówki. Po bezpiecznym locie wybierz Teraz naucz Piko.
2. Naucz Piko: sprawdź jego scenariuszowy pomysł, popraw wzór, przewidź y dla x obu bramek i wyjaśnij zmianę w jednym lub dwóch zdaniach. Sprawdź naprawę przelicza tor i prognozy. Wybierz Powiedz Piko i przeczytaj parafrazę. Jeśli Piko źle Cię zrozumiał, popraw wyjaśnienie i wyślij je ponownie. Po sprawdzeniu toru i prognoz potwierdź treść notatki z lekcji. Możesz też zapisać ją bez parafrazy.
3. Lot Piko: robot otrzymuje nową planszę, sprawdzoną zasadę i zapisaną notatkę z lekcji. Poproś o propozycję, wybierz Przeleci, Nie przeleci albo Jeszcze nie wiem, a potem sprawdź lot. Możesz zezwolić na jedną poprawkę. Po problemach z odpowiedzią wybierz demo albo Pomiń lot Piko. Limit dwóch nieudanych tur live zostaje po odświeżeniu.
4. Twój samodzielny lot: to kolejna, osobna plansza. Przed pierwszą próbą nie ma toru, automatycznych wartości y, rozmowy, wskazówek ani dziennika. Wpisz wzór i wybierz Sprawdź mój lot. Błąd składni nie liczy się jako próba. Pierwszy parsowalny wzór i jego wynik są niezmiennie zachowane. Po porażce możesz poprawiać wzór; podsumowanie rozróżnia pierwszą próbę i późniejsze ukończenie.

## Zapis wzoru

Dozwolone są liczby, x, +, -, *, / przez stałą, nawiasy i potęgi 0, 1, 2. Przykłady składni: 2x+1; 0,5x; 0.25(x-2)^2+1; (x+1)(x-1). To przykłady języka, a nie odpowiedzi do aktualnej misji. Możesz dopisać y= lub f(x)=. Funkcje sin i sqrt, dzielenie przez x oraz stopień 3 są niedozwolone. -x^2 oznacza ujemny kwadrat, a (-x)^2 dodatni kwadrat. 1/2x znaczy (1/2)*x.

## Sterowanie i czytelność

Tab przechodzi między polami i przyciskami. Enter w polu wzoru uruchamia lot; Enter w wyjaśnieniu tworzy nową linię. Przyciski aktywujesz Enter lub spacją. Escape zamyka pomoc, dziennik i ustawienia, zachowując wpisy. Pokaż wynik pomija animację. W Ustawieniach włącz ograniczenie ruchu, obrys robota albo większy tekst. Preferencja ograniczonego ruchu z systemu też jest respektowana. Wyniki mają tekst i symbole, a nie sam kolor.

## Postęp i dane

Postęp zapisuje się lokalnie na urządzeniu. Zmiana przeglądarki/profilu lub usunięcie danych przeglądarki może go usunąć. Powtórzenie ukończonej misji archiwizuje poprzednie podejście; podsumowanie pozwala je rozwinąć. Samo odświeżenie nie resetuje pierwszej próby. Dziennik pokazuje kanoniczne zasady i oddzielne obserwacje lotów. Powrót do dziennika po pierwszej próbie oznacza późniejsze podejście jako po powtórce.

Wyczyść rozmowę usuwa wiadomości tej lekcji z widoku i aktywnej sesji serwera. Wyniki i zapisane notatki pozostają w zapisie gry. Usuń lokalny postęp usuwa bieżący zapis na urządzeniu po potwierdzeniu.

Aplikacja przenosi zapisy wersji 1 do wersji 2. Ekran odzyskiwania pozwala zachować kopię uszkodzonego lub nieznanego zapisu przed rozpoczęciem nowego. Gdy pamięć urządzenia odrzuca zapis, bieżący postęp pozostaje w otwartej karcie.

W live do usługi AI trafia Twoje wyjaśnienie, notatka, bieżąca plansza i potrzebne reguły. Serwer gry przechowuje bieżącą rozmowę w sesji SQLite, która wygasa po 24 godzinach. Wyczyść rozmowę działa na serwerze gry. Dane wysłane do dostawcy podlegają ustawieniom konta API. W demo odpowiedzi są scenariuszowe i działają lokalnie.

Piko odgrywa ucznia; nie trenujemy wag modelu. Wyniki opisują wykonanie zadań w tej sesji. Nie są diagnozą wiedzy ani dowodem trwałej skuteczności edukacyjnej.
