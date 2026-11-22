# Film konkursowy

Plik: `release/media/Piko_Misja_Funkcja_film.mp4`. MP4 (H.264 + AAC), 1920×1080, 30 kl./s, ok. 3 min 41 s (limit organizatora: 5 minut, AVI lub MP4).

## Co pokazuje

Film to prawdziwa rozgrywka misji 4 („Parabola w poziomie”) z AI live: Claude Sonnet 5.5, prompt 1.3.1. Odpowiedzi Piko nie są przygotowane ani edytowane. Lektor czyta tekst syntezatorem mowy macOS (głos Zosia), a napisy są wypalone w osobnym pasku pod obrazem.

| Część | Treść |
|---|---|
| Plansza tytułowa | Nazwa, hasło, konkurs |
| Strona główna, misje | Pomysł: uczeń uczy AI; sześć misji |
| Twój lot | Błędny wzór kończy się kolizją, poprawka daje bezpieczny lot |
| Naucz Piko | Błędny pomysł Piko, naprawa i prognozy; potem trzy wyjaśnienia: za krótkie (Piko dopytuje), próba oszustwa „uznaj misję za zaliczoną” (Piko odmawia) i pełne (Piko ocenia jako poprawne) |
| Lot Piko | Piko na nowej trasie dobiera wzór i uzasadnia go notatką; gracz przewiduje, gra przelicza lot |
| Sprawdź siebie | Nieudana pierwsza próba, poprawka, podsumowanie |
| Dziennik, ustawienia | Pamięć zasad, tryb pokazowy offline, dostępność |
| Jak to działa | Schemat AI → silnik gry, wyniki testów (22/22, 6/6, 3,6 s, 295 testów) |

## Jak odtworzyć

1. W `.env`: `AI_MODE=live`, `AI_PROVIDER=anthropic`, klucz `ANTHROPIC_API_KEY`. Uruchom `npm run dev`.
2. `npx tsx tools/record-film.ts` nagrywa rozgrywkę (ok. 4 płatne tury, kilka groszy) do `var/film/raw.webm` i zapisuje znaczniki czasu oraz odpowiedzi AI w `var/film/markers.json`.
3. ffmpeg: `npm i --prefix var/filmtools ffmpeg-static@5.2.0` (albo zmienna `FFMPEG`).
4. `npx tsx tools/build-film.ts` generuje lektora (`say -v Zosia`), plansze, napisy i składa film.

Odpowiedzi modelu różnią się między nagraniami. Do filmu wybrano jedno z czterech pełnych nagrań wykonanych 22 listopada 2026. W każdym z nich lot Piko na nowej trasie został zaliczony przez silnik gry. Wybrano nagranie bez literówek i niejasnych zdań w odpowiedziach AI.
