# Odbiór Piko: Misja Funkcja

Stan lokalny z 18 listopada 2026, gałąź `codex/jury-readiness`. Przyjęto nazwę rekomendowaną w briefie autora. Model to GPT-6 Luna Extra High, prompt 1.2.0. Ta runda wykorzystała zero płatnych żądań.

## Wykonany przebieg

W M01 wpisano wzór, wykonano lot, naprawę z dwiema prognozami i zapis notatki. Następnie sprawdzono stan oczekiwania z lokalną atrapą, pominięcie, pierwszą błędną próbę i korektę oraz wznowienie. Ekrany zwykły, oczekiwania i wyniku zapisano przed przeniesieniem wzorca na start, mapę i podsumowanie. Osobna regresja porównała znaczniki i zatrzymanie animacji z wynikiem silnika.

Otworzono stary pakiet w tymczasowym profilu Electrona, zapisano pierwszą próbę i notatkę, zamknięto go i otworzono nowy pakiet z tym samym profilem. Zachował się techniczny katalog `naucz-pilota`, pierwszy wynik i notatka. To wykonana próba na macOS. Runtime Windows ma status NOT RUN.

## Pliki lokalne

- `var/visual-2026-11-18/prototype/` zawiera trzy zrzuty wzorcowej M01 i raport axe.
- `var/visual-2026-11-18/screens/` zawiera dziewięć końcowych widoków. Oczekiwanie jest oznaczone jako próba z lokalną atrapą. Pozostałe widoki pokazują demo.
- `var/visual-2026-11-18/windows/Piko_Misja_Funkcja_1.0.0_Windows_x64.zip` jest aktualnym niepodpisanym kandydatem offline. Kontrola objęła CRC, PE, aktualność ASAR oraz nową ikonę i nazwę produktu w zasobach Windows.
- `release/media/Piko_Misja_Funkcja_demo.mp4` pokazuje 41,04 s aktualnego demo M04. Zawiera porażkę Piko `START_MISS` i oddzielny wynik pierwszej próby gracza po korekcie i odświeżeniu. Klip ma napisy i ograniczony ruch.
- `var/visual-2026-11-18/zgloszenie/` zbiera źródła, ZIP Windows, instrukcje, jednostronicowy opis, klip i raporty. `STAN_PACZKI.json` podaje otwarte braki. Jest to lokalny zestaw do odbioru przez autora.

Raport maszynowy jest w `checks/piko-readiness-2026-11-18.json`. Logi rzeczywistych poleceń są w `var/visual-2026-11-18/`. Starsze raporty odnoszą się do przypisanych im dat i kodu.

## Dostęp dla jury

Przy nieznanym adresie IP odbiorcy przygotowano wariant z kodem. Operator na swoim hoście konfiguruje DNS i HTTPS, klucz OpenAI, oddzielny losowy `JURY_ACCESS_CODE` oraz budżet. Odbiorca wpisuje kod w ustawieniach. Budżet domyślnie wynosi zero. Lokalny smoke sprawdza prawdziwy Caddy i wymaganie kodu, a rozmowa Electrona korzysta z atrap.

Do rzeczywistego wdrożenia brakuje zatwierdzonego hosta, nazwy DNS i dostępu operatora. Odbiór z innego komputera i sieci pozostaje NOT RUN. Kroki i ograniczenia są w [protokole HTTPS](17-odbior-live.md). Weryfikacja zdrowia z kodem nie jest wywołaniem modelu. Płatna tura odbioru wymaga osobnej zgody na konkretną liczbę żądań.

## Kolejne czynności autora

1. Na rzeczywistym Windows rozpakuj kandydat, sprawdź pierwszy cykl, klawiaturę, tekst i wznowienie. Następnie sprawdź połączenie z docelowym HTTPS, kod i brak sieci. [Protokół Windows](16-windows-odbior.md)
2. Przeprowadź 3–5 sesji pilotażu i zapisz konkretne momenty zagubienia oraz udzieloną pomoc. Planowany termin 22–24 listopada. [Karta obserwacji](15-pilotaz.md)
3. Ukończ narrację i montaż filmu z aktualnym interfejsem. Planowany termin 24–26 listopada. Historyczny wynik modelu pokaż z datą i źródłem. [Scenopis](18-film-konkursowy.md)
4. Uzupełnij i podpisz oryginalne formularze. Sprawdź kompletny folder i pobieranie z linku. Planowane przekazanie przez autora 27 listopada, termin organizatora 29 listopada 2026. [Wymogi UwB](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas)

Pilotaż i HTTPS służą odbiorowi tej aplikacji. Formalne materiały wymagane przez organizatora określa regulamin. [Checklista](../release/CHECKLISTA.md)
