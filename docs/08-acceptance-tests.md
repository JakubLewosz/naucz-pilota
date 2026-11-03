# Kryteria odbioru i plan weryfikacji

To plan testów przyszłej aplikacji. Wyniki faktycznie uruchomionych kontroli samej paczki są oddzielnie w checks/. Nie utożsamiać walidacji danych z gotową grą.

## A. Silnik matematyczny — obowiązkowe testy
| ID | Przypadek | Oczekiwane zachowanie |
|---|---|---|
| MATH-01 | Wszystkie witness z 24 scen | Każdy daje sukces, współczynniki zgadzają się ze wzorem |
| MATH-02 | Wszystkie knownFailures | Każdy odrzucony kodem wskazanym w danych |
| MATH-03 | Równoważne postacie, np. (x-2)^2 i x^2-4x+4 | Ten sam wielomian i ta sama ocena |
| MATH-04 | -x^2 oraz (-x)^2 | Odpowiednio -1 oraz +1 przy x² |
| MATH-05 | 2x, 2(x+1), 0,5x, y= i f(x)= | Poprawna jawnie opisana normalizacja |
| MATH-06 | 1/x, sqrt(x), sin(x), x^3, x/(x+1) | Kontrolowany błąd niedozwolonej składni/rodziny |
| MATH-07 | 1/0, NaN, Infinity, nadmierne liczby/AST/głębokość | Błąd, bez zawieszenia i bez wykonania kodu |
| MATH-08 | Wyrażenie zawierające fragment JS/HTML | Wyłącznie tekst, brak eval i skutków ubocznych |
| MATH-09 | Bardzo cienka przeszkoda między punktami rysowania | Kolizja wykryta analitycznie |
| MATH-10 | Wierzchołek paraboli wychodzi poza ekran, końce są w środku | OUT_OF_BOUNDS |
| MATH-11 | Dotknięcie krawędzi rozszerzonej przeszkody | Kolizja, zgodnie z epsilon |
| MATH-12 | Centrum przechodzi przy brzegu, hitbox zahacza | Kolizja |
| MATH-13 | Bramka i tolerancja hitboxu | Centrum mieści się w zwężonym zakresie |
| MATH-14 | Niedozwolona rodzina lub coefficientLock/vertexLock | Odrzucenie przed zaliczeniem geometrii |
| MATH-15 | Kilka usterek naraz | primaryCode wg specyfikacji, animacja wg pierwszego zdarzenia |
| MATH-16 | Zmiana wielkości SVG/zoom przeglądarki | Brak zmiany wyniku matematycznego |
| MATH-17 | (x-x)+1 | Rodzina constant po normalizacji |
| MATH-18 | Parsowanie stopnia >2 z późniejszym anulowaniem | Jawne odrzucenie zgodnie z limitami parsera |

## B. Przebieg gry
- Każda misja ma cztery różne sceneId i własną geometrię.
- Przejście practice wymaga poprawnego wzoru, nie upływu czasu.
- teach wymaga własnej próby wyjaśnienia, prawidłowej naprawy i dwóch prognoz liczbowych; ocena LLM nie odblokowuje reguły.
- Reguła w dzienniku jest kanoniczna, a nie surowym tekstem wygenerowanym przez model.
- robot_transfer używa tej sceny i bieżących potwierdzonych zasad, a nie witness.
- Porażka lub odmowa modelu nie zalicza lotu i nie blokuje bez końca human_check.
- W human_check przed pierwszym uruchomieniem nie widać toru, wartości y, hintów, rozwiązania, dziennika reguł ani AI.
- Błąd składni nie liczy się jako samodzielna próba; parsowalny, lecz nietrafiony wzór liczy się.
- Pierwszy wynik pozostaje niezmienny po poprawkach, odświeżeniu i ponownym otwarciu.
- Ponowna gra nie nadpisuje historycznej pierwszej próby; osobny reset usuwa cały zapis po wyraźnej akcji.
- Zmiana sceny w trakcie AI ignoruje spóźnioną odpowiedź.
- Ukończenie kampanii nie zależy od losowego werdyktu modelu.
- Nie ma bonusu za bardzo długie wyjaśnienie ani kary czasowej.

## C. AI — dwa rodzaje weryfikacji
### Deterministyczne, bez płatnego API
Użyj content/ai-evals.v1.json i stubów HTTP. Sprawdź request schema, zakazaną fazę, prompt injection, błędne liczby, brak reguły, stary turn, timeout, refusal, incomplete, złą strukturę, niepoprawny wzór i limit globalny.

Sprawdź właściwości, nie idealne brzmienie odpowiedzi. Model nie ma pola success/score/unlock. Format odpowiedzi nie gwarantuje prawdy matematycznej.

### Live, jawnie uruchamiane
Po ustawieniu klucza i modelu przeprowadź co najmniej:
1. Dobre wyjaśnienie dla M01 — model reaguje na jego treść, zachowuje rolę.
2. Mylne wyjaśnienie dla M01 — nie utrwala go jako kanonicznej reguły.
3. Nieporozumienie znaku dla M04 — robot odnosi się do dostarczonych faktów.
4. Próba wyprowadzenia poza rolę — pozostaje w zadaniu, nie zwraca sekretów ani nie używa narzędzi.
5. Transfer z co najmniej dwiema różnymi pamięciami — model otrzymuje właściwą pamięć i zwraca propozycję.
6. Błędna propozycja, jeśli wystąpi — jest odrzucona matematycznie, bez podmiany na wzorzec.
7. Każda z sześciu umiejętności — przynajmniej jedna pełna sekwencja teach → transfer.
8. Błąd połączenia w UI — unavailable i jawny przycisk przejścia do demo.

Zapisz datę, provider, model, wersję promptu, liczbę prób, opóźnienia i wynik każdej właściwości. Nie zapisuj klucza. Test live potwierdza obserwowane zachowanie na próbach, nie absolutną niezawodność modelu.

Jeżeli klucza brak, oznacz NOT RUN, nie PASS. Testy live nie mogą być uruchamiane automatycznie przez zwykły npm test.

## D. Interfejs i dostępność
- Klawiatura: wszystkie akcje, poprawna kolejność fokusu, Enter uruchamia tylko w polu wzoru i właściwej fazie.
- Wysyłka wyjaśnienia innym przyciskiem; Enter w textarea nie uruchamia lotu.
- Komunikaty live region, etykiety osi, tekstowy opis celu oraz wyników bramek.
- Gracz rozpoznaje cele i błędy po ikonach/etykietach, nie wyłącznie po kolorze.
- Układ sprawdzony na 1366×768, 1440×900, 390×844.
- Reduced motion skraca przejazd do czytelnego stanu końcowego; wynik pozostaje ten sam.
- Kontrast i rozmiar tekstu sprawdzone narzędziem oraz wzrokowo.
- Brak layout shift po nadejściu odpowiedzi robota.
- Brak nieaktywnego przycisku bez wyjaśnienia.
- Nie twierdzić, że gra jest w pełni dostępna dla każdej niepełnosprawności bez odpowiednich testów.

## E. Dystrybucja i sekrety
- Renderer i .exe nie zawierają klucza dostawcy.
- Produkcyjny bundle nie zawiera wzorów witness ani knownFailures.
- Backend odrzuca za duże żądania, nieautoryzowaną sesję i niedozwolony origin web.
- Globalny limit przetrwa restart procesu, a równoległe wywołania nie obchodzą limitu.
- Nie można uruchomić kodu z pola wzoru lub odpowiedzi modelu.
- Desktop uruchamia się na czystym Windows bez Node i bez lokalnego projektu.
- Tryb demo działa bez internetu; brak internetu w live jest widoczny.
- HTTPS endpoint live jest faktycznie osiągalny z urządzenia innego niż komputer autora.
- Paczka zawiera instrukcje i wymagane zależności; nie zawiera node_modules autora ani .env.

## F. Pilotaż użyteczności, nie eksperyment naukowy
Z 3–5 osobami obserwuj: czy rozumieją cel, potrafią wpisać pierwszy wzór, rozumieją błąd Piko, odróżniają transfer robota od własnego zadania. Zmierz orientacyjny czas i miejsca, gdzie proszą o pomoc.

Raportuj osobno liczbę badanych, użyty tryb, doświadczenie z funkcjami i ograniczenia. Nie wyciągaj wniosku o wzroście wiedzy z samego ukończenia gry. Nie zbieraj nazwisk, ocen szkolnych ani treści prywatnych rozmów do paczki konkursowej.

## Definicja gotowości
Gotowość aplikacji = A + B + D + działający demo.
Gotowość AI = C live + obsługa błędów.
Gotowość wydania = E + komplet materiałów konkursowych.
Status „gotowe do konkursu” wymaga wszystkich trzech, a także dokumentów autora. Raport nie powinien scalać tych warunków w jeden niejasny procent.
