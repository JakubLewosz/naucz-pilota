# Odbiór Windows — spakowana aplikacja

Wydanie `v1.0.0` ma dowód WINDOWS CI PASS dla kodu `52ac710` w [przebiegu 42685071630](https://github.com/JakubLewosz/naucz-pilota/actions/runs/42685071630). Aktualna gałąź odbioru i komputer użytkownika mają osobne statusy. Test na komputerze odbiorcy ma status NOT RUN.

## Automatyczny odbiór na Windows

Z katalogu źródeł, po instalacji Node 24.x:

```powershell
npm ci
npm run desktop:dist
npm run desktop:smoke -- --executable "release/bin/win-unpacked/Naucz Pilota.exe"
npm run release:check
```

Smoke uruchamia wskazany plik EXE z osobnym profilem, przechodzi M01 w demo, sprawdza brak Node w rendererze i pomocy przed pierwszą próbą, wykonuje błędną pierwszą próbę i poprawkę, zamyka aplikację, uruchamia ją ponownie i porównuje zapis pierwszej próby. Raport jest w checks/desktop-smoke.json; PASS Windows jest zapisywany wyłącznie wtedy, gdy proces rzeczywiście działa na win32 i podano spakowany executable.

W `.github/workflows/verify.yml` przygotowano ręcznie uruchamiany workflow. Po umieszczeniu kodu w wybranym repozytorium GitHub otwórz Actions → Verify release on Windows and Linux → Run workflow. Job Windows uruchamia EXE; job Linux sprawdza kontener. Workflow nie otrzymuje klucza API i nie uruchamia płatnych testów. Zapisz SHA rzeczywiście sprawdzonego commita i odróżnij go od SHA bieżących poprawek.

## Ręczny test na komputerze odbiorcy bez Node

Użyj osobnego komputera z Windows x64 bez narzędzi projektu. Pobierz dokładnie oznaczony artefakt wydania, porównaj SHA-256 z raportem tej paczki i zapisz tag oraz SHA kodu. Dla v1.0.0 użyj wartości w `checks/windows-actions-audit.json`. W PowerShell sprawdzisz plik przez `Get-FileHash -Algorithm SHA256 <ścieżka-do-pobranego-pliku>`. Rozpakuj cały katalog do ścieżki ze spacjami i uruchom EXE. Zapisz system oraz wynik każdej pozycji. Próby live wykonaj dopiero z zatwierdzonym HTTPS i zgodą na budżet według [protokołu live](17-odbior-live.md).

| Próba | Wynik obecny |
|---|---|
| Start EXE bez Node/Pythona i bez katalogu źródeł | NOT RUN |
| Start bez internetu, jawna etykieta demo | NOT RUN |
| M01: wszystkie cztery sceny i podsumowanie | NOT RUN |
| Zapis po zamknięciu i ponownym uruchomieniu | NOT RUN |
| Pierwsza parsowalna próba zachowana po poprawce i restarcie | NOT RUN |
| Pełna kampania sześciu misji | NOT RUN |
| Klawiatura, reduced motion i powiększony tekst | NOT RUN |
| Live z rzeczywiście skonfigurowanym HTTPS backendu | NOT RUN |
| Odłączenie sieci w live: zachowane wpisy, jawny błąd i wybór demo | NOT RUN |

Dołącz raport automatyczny oraz własne obserwacje. Nie podpisuj testu automatycznego jako testu ręcznego na czystym komputerze. Komunikat o nieznanym wydawcy jest możliwy, ponieważ paczka nie ma podpisu cyfrowego.
