# Odbiór zgłoszenia konkursowego

Stan na 18 listopada 2026 dla lokalnego kandydata „Piko: Misja Funkcja” na `codex/jury-readiness`. Organizator przyjmuje kompletne zgłoszenia do **29 listopada 2026**. Pakiet przekazuje się przez link do chmury. [Strona organizatora i pliki do pobrania](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas)

## Materiały wymagane przez organizatora

| Wymóg | Stan kandydata | Dowód lub krok do wykonania |
|---|---|---|
| Wypełniona i podpisana karta zgłoszenia | NOT RUN | Uczestnicy uzupełniają i podpisują oryginalny formularz. |
| Wypełniona i podpisana klauzula informacyjna | NOT RUN | Uczestnicy uzupełniają i podpisują oryginał. Jeżeli jest wymagana zgoda opiekuna, dopełnij jej przed wysłaniem. |
| Kod źródłowy i instrukcja kompilacji | GOTOWE LOKALNIE | ZIP źródeł i lockfile, aktualne [polecenia kompilacji](../docs/11-uruchomienie.md). |
| Wersja binarna i instrukcja uruchomienia | CROSS-BUILD PASS, WINDOWS NOT RUN | Aktualny ZIP Windows x64 w jawnym demo i aktualna instrukcja. Oddzielna paczka testowa HTTPS wskazuje loopback. [Protokół Windows](../docs/16-windows-odbior.md) |
| Instrukcja użytkownika | GOTOWA LOKALNIE | [Instrukcja użytkownika](../docs/12-instrukcja-uzytkownika.md) i odpowiadający PDF. |
| Film AVI/MP4 do 5 minut | FINALNY MONTAŻ NOT RUN | Klip aktualnego demo 41,04 s, scenopis 4 min 20 s i historyczne wypowiedzi live opisano w [materiałach filmowych](../docs/18-film-konkursowy.md). |
| Opis funkcjonalności do jednej strony | GOTOWY LOKALNIE | Jednostronicowy PDF z aktualnym wynikiem M04. [Tekst źródłowy](../docs/14-opis-funkcjonalnosci.md) |
| Link z pełnym zestawem i wysłanie zgłoszenia | NOT RUN | Autor wybiera chmurę, sprawdza pobieranie spoza własnego konta i wysyła link na adres podany przez organizatora. |

Uprawnienia uczestnika weryfikuje autor. Organizator wymaga statusu ucznia szkoły ponadpodstawowej, wieku poniżej 21 lat przez cały konkurs, drużyny maksymalnie dwuosobowej i udziału w jednej drużynie. Zgoda opiekuna dotyczy osób niepełnoletnich. Kwestionariusz laureata dotyczy późniejszego etapu. [Oficjalne warunki](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas)

## Odbiór techniczny przed wysłaniem

- [x] Pełna kampania, zapis pierwszej próby, jawne demo i rozdzielony wynik silnika.
- [x] Historyczna próba GPT-6 Luna Extra High 1.2.0. Silnik zaliczył 7/7 otrzymanych wzorów na dwóch geometriach poza kampanią. Jedna dodatkowa próba przekroczyła czas. [Wyniki](../checks/m04-generalization-1.2.0.live.md)
- [x] Ograniczony HTTPS na lokalnym Caddy, w tym wariant z kodem dla nieznanej sieci. Zaufanie do certyfikatu, lista sieci, limit budżetu zero i restart SQLite. [Raport](../checks/jury-https-smoke.json)
- [ ] Docelowy HTTPS, tura z realnym dostawcą w aplikacji na tym adresie, zatwierdzony origin w finalnej paczce Windows. NOT RUN.
- [ ] Aktualny EXE na Windows i odbiór na osobnym komputerze bez Node. NOT RUN. Wcześniejszy test GitHub Actions dotyczy commita `52ac710`.
- [ ] Pilotaż 3–5 osób i poprawki z rzeczywistych obserwacji. NOT RUN. [Protokół](../docs/15-pilotaz.md)
- [ ] Sprawdzenie kompletnego zestawu z finalnym filmem, podpisanymi dokumentami i linkiem widocznym dla organizatora. NOT RUN.

- [x] Nowa nazwa, ikona Windows i otwarcie starego profilu w spakowanej aplikacji na macOS. [Bieżący odbiór](../docs/20-odbior-kandydata.md)
