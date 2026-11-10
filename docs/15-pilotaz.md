# Pilotaż użyteczności — protokół do wykonania

Status: NOT RUN. Nie ma jeszcze uczestników ani wyników. To test zrozumiałości obsługi, bez twierdzeń o wzroście wiedzy.

## Przygotowanie

Zaproś 3–5 osób. Używaj identyfikatorów P01–P05; nie zapisuj nazwisk, danych kontaktowych, ocen szkolnych ani prywatnych rozmów. Dla każdej próby zapisz wersję aplikacji/commit, tryb demo lub live oraz orientacyjną wcześniejszą znajomość funkcji (brak/podstawy/swobodna). Nowy lokalny profil przeglądarki zapewnia osobny postęp bez usuwania zapisu autora.

Zarezerwuj 20 minut na osobę. Na początku wyjaśnij, że obserwujesz aplikację i że uczestnik może przerwać w każdej chwili. Uzyskaj zgodę na udział, a przy osobach niepełnoletnich także wymaganą zgodę opiekuna. Domyślnie używaj notatek obserwatora bez nagrywania ekranu lub dźwięku. Zacznij od jawnego demo w M01.

## Polecenie dla uczestnika

„Twoim celem jest przeprowadzić robota przez bramki, wyjaśnić mu zasadę, sprawdzić jego pomysł, a potem rozwiązać nową planszę samodzielnie. Zacznij od pierwszej misji. Mów, co próbujesz zrobić i co jest niejasne.”

## Obserwacja

Nie podawaj wzorów ani odpowiedzi do G1/G2. Gdy potrzebna jest pomoc, zapisz moment i rodzaj pomocy przed jej udzieleniem. Porażka robota jest dopuszczalnym wynikiem. W human_check nie otwieraj wskazówek ani dziennika przed pierwszą próbą. Jeśli problem uniemożliwia grę, przerwij próbę i zapisz usterkę.

Sprawdź, czy uczestnik:

1. Rozpoznaje start, bramki, przeszkodę, cel i znaczenie rozmiaru robota.
2. Znajduje pole wzoru, uruchamia lot i rozumie komunikat porażki.
3. Potrafi podać dwie prognozy i odróżnia sprawdzone liczby od komentarza Piko.
4. Własnymi słowami rozróżnia zapis swojej notatki, przygotowany komentarz demo i regułę sprawdzoną liczbami.
5. Przewiduje lot robota przed odsłonięciem wyniku.
6. Odróżnia nową samodzielną planszę od transferu Piko i rozumie trwałość pierwszej próby.
7. Odczytuje etykietę demo/live/unavailable i potrafi wrócić do gry po niedostępności AI.
8. Rozumie, dlaczego zasada jest ukryta przed pierwszą próbą i gdzie po próbie znajdzie dziennik.

Dla punktów 2–8 zaznacz „samodzielnie”, „po pomocy” lub „nie ukończono”. Zapisz, czy osoba bez podpowiedzi odróżniła wynik silnika od komentarza Piko oraz demo od live. Priorytetem poprawki jest każda blokada, a następnie myląca etykieta powtórzona przez co najmniej dwie osoby. Raportuj liczby obserwacji i zakres zadania jako wynik użyteczności.

## Oddzielna próba oczekiwania i pominięcia

Po M01 zleć uczestnikowi krótką powtórkę lub użyj przygotowanego odrębnego profilu w `robot_transfer`. W zaproszeniu do tej próby powiedz „Sprawdź, co możesz zrobić, gdy odpowiedź się opóźnia”. Po wyborze poproś o wyjaśnienie własnymi słowami, co stało się z notatką i gdzie zapisze się jego pierwsza próba. Zanotuj czas od pojawienia się komunikatu do decyzji i czy uczestnik znalazł pominięcie bez pomocy. Sprawdź także przejście klawiaturą u co najmniej jednej osoby.

Technicznie można użyć lokalnego backendu z syntetycznym kluczem i `AI_DAILY_REQUEST_BUDGET=0`. W Chromium włącz dla tej próby opóźnienie około 3 s, poniżej 5-sekundowego limitu utworzenia sesji. Poinformuj uczestnika, że to próba interfejsu z zablokowanym dostawcą. Po pozostaniu na ekranie oczekuj jawnego komunikatu o limicie. Jeśli kontrolowane opóźnienie jest niedostępne, oznacz ten fragment jako NOT RUN. W standardowym demo propozycja może być natychmiastowa.

## Karta obserwacji — powiel dla każdej osoby

- Identyfikator: do uzupełnienia.
- Wersja/commit, urządzenie, tryb: do uzupełnienia.
- Wcześniejsza znajomość funkcji: do uzupełnienia.
- Początek/koniec M01 i orientacyjny czas: do zmierzenia.
- Miejsca prośby o pomoc i konkretna udzielona pomoc: do zapisania.
- Niejasne etykiety/akcje, cytat bez danych osobowych: do zapisania.
- Pomylenie wyniku robota i człowieka: tak/nie/nie sprawdzono.
- Źródło sprawdzonych liczb i znaczenie etykiety trybu wskazane bez pomocy: tak/nie/nie sprawdzono.
- Próba oczekiwania, czas decyzji i odnalezienie przycisku: do uzupełnienia lub NOT RUN.
- Własnymi słowami o zapisanej notatce i osobnej próbie: do zapisania.
- Błędy techniczne: do zapisania.
- Obserwacja autora, bez oceny osoby: do zapisania.

## Po próbach

Pogrupuj problemy według częstotliwości i wpływu na ukończenie misji. Najpierw napraw blokady i mylące komunikaty. Powtórz problematyczny fragment po poprawce. W raporcie podaj rzeczywistą liczbę osób, tryb i ograniczenia, zachowując status NOT RUN dla nieprzeprowadzonych prób. Nie wyciągaj wniosków o skuteczności nauczania z samego ukończenia gry.
