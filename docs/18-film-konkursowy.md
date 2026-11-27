# Film konkursowy

Plik: `release/media/Piko_Misja_Funkcja_film.mp4`. MP4 (H.264 + AAC), 1920×1080, 30 kl./s, 2 min 31 s (limit organizatora: 5 minut).

## Forma

Film jest animacją renderowaną klatka po klatce (HTML + Playwright), z czterema wstawkami z prawdziwej gry w ramce okna. Odpowiedzi Piko w dymkach pochodzą z nagrania prawdziwej rozgrywki misji 4 z Claude Sonnet 5.5 (prompt 2.0.0): przekonania Piko są cytowane dosłownie, uzasadnienia lotów we fragmentach. Pełny zapis tych odpowiedzi i ich dopasowanie do scen: [checks/film-odpowiedzi-ai.json](https://github.com/JakubLewosz/naucz-pilota/blob/main/checks/film-odpowiedzi-ai.json).

| Scena | Treść |
|---|---|
| Haczyk | AI i uczeń; strzałka „tłumaczy” odwraca się w „uczy” |
| Tytuł | Piko: Misja Funkcja |
| Zasady | Wzór rysuje tor, Piko leci przez bramki |
| Wstawka 1 | Lot gracza w prawdziwej grze |
| Cztery kroki | Twój lot, Naucz Piko, Lot Piko, Sprawdź siebie |
| Lekcja 1 | Niepełne wyjaśnienie; Piko zapamiętuje je i pyta „w którą stronę? o ile?” |
| Lot 1 | Piko stosuje lekcję i się rozbija |
| Wstawka 2 | To samo rozbicie w grze |
| Wniosek | Błąd Piko pokazuje lukę w wyjaśnieniu ucznia |
| Lekcja 2 | Pełne wyjaśnienie z rysunkiem wierzchołka |
| Lot 2 | Udany lot, konfetti |
| Wstawki 3–4 | Udany lot w grze, samodzielna próba, dziennik |
| Jak to działa | Lekcja → Claude jako Piko → wzór → silnik gry |

## Jak odtworzyć

1. Nagranie rozgrywki: `npx tsx tools/record-film.ts` (wymaga `npm run dev` z AI_MODE=live).
2. Narzędzia: Piper TTS w `var/tts` z głosami `pl_PL-mc_speech-medium` (lektor) i `pl_PL-gosia-medium` (Piko) w `var/film/voice`, ffmpeg w `var/filmtools`.
3. Render: `npx tsx tools/build-film-b.ts` (podgląd wybranych sekund: `--frames=12,40`). Wynik: `release/media/Piko_Misja_Funkcja_film_v3.mp4`, skopiowany jako film zgłoszenia.

Starsze wersje montażu: `tools/build-film.ts` (wersja 1) i `tools/build-film-v2.ts` (wersja 2).
