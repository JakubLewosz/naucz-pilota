# Odbiór Windows — spakowana aplikacja

Status obecny: NOT RUN na Windows. Lokalny smoke macOS i cross-build nie zastępują uruchomienia na Windows.

## Automatyczny odbiór na Windows

Z katalogu źródeł, po instalacji Node 24.x:

```powershell
npm ci
npm run desktop:dist
npm run desktop:smoke -- --executable "release/bin/win-unpacked/Naucz Pilota.exe"
npm run release:check
```

Smoke uruchamia wskazany plik EXE z osobnym profilem, przechodzi M01 w demo, sprawdza brak Node w rendererze i pomocy przed pierwszą próbą, wykonuje błędną pierwszą próbę i poprawkę, zamyka aplikację, uruchamia ją ponownie i porównuje zapis pierwszej próby. Raport jest w checks/desktop-smoke.json; PASS Windows jest zapisywany wyłącznie wtedy, gdy proces rzeczywiście działa na win32 i podano spakowany executable.

W `.github/workflows/verify.yml` przygotowano ręcznie uruchamiany workflow. Po umieszczeniu kodu w wybranym repozytorium GitHub otwórz Actions → Verify release on Windows and Linux → Run workflow. Job Windows uruchamia EXE; job Linux sprawdza kontener. Workflow nie otrzymuje klucza API i nie uruchamia płatnych testów. Z tego lokalnego repozytorium nie wykonano publikacji ani uruchomienia workflow; nie ma skonfigurowanego remote.

## Ręczny test na komputerze odbiorcy bez Node

Użyj innego komputera z Windows x64. Nie instaluj na nim narzędzi projektu. Rozpakuj cały ZIP do katalogu zawierającego spacje w nazwie i uruchom EXE. Zapisz system, wersję paczki i rzeczywisty wynik każdej pozycji.

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
