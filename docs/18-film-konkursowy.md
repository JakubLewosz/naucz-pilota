# Film konkursowy

Plik: `release/media/Piko_Misja_Funkcja_film.mp4`. MP4 (H.264 + AAC), 1920×1080, 30 kl./s, 2 min 56 s (limit organizatora: 5 minut).

## Scenariusz

Prawdziwa rozgrywka misji 4 („Parabola w poziomie”) z AI live (Claude Sonnet 5.5, prompt 2.0.0). Odpowiedzi Piko nie są edytowane.

| Część | Treść |
|---|---|
| Plansza otwierająca | „Co by się stało, gdyby to uczeń uczył sztuczną inteligencję?”, Piko leci po rysującej się paraboli |
| Start, misje | Pomysł gry, sześć misji |
| Twój lot | Błędny wzór kończy się kolizją, poprawka daje bezpieczny lot |
| Lekcja 1 | Uczeń poprawia wzór Piko, ale wyjaśnia niepełnie („plus w nawiasie przesuwa parabolę”). Piko zapamiętuje to i sam zauważa, czego nie wie |
| Lot Piko 1 | Piko stosuje lekcję na nowej trasie (`0,25(x+2)²`) i się rozbija |
| Lekcja 2 | Pełne wyjaśnienie (nawias zeruje się w wierzchołku). Piko zapamiętuje ogólną regułę |
| Lot Piko 2 | Piko wybiera `0,25(x−2)²` i przelatuje |
| Sprawdź siebie, podsumowanie, dziennik | Samodzielny lot ucznia i porównanie pamięci Piko z zasadą gry |
| Jak to działa | Animowany schemat: lekcja → Claude jako Piko → lot według lekcji → silnik matematyczny |
| Plansza końcowa | Nazwa i hasło |

## Realizacja

- Nagranie: Playwright, okno 1920×1200 z powiększeniem strony 1,5 (układ jak na laptopie, ostry obraz), widoczny kursor z efektem kliknięcia. Montaż kadruje i powiększa ważne miejsca z lekkim ruchem kamery, segmenty łączy płynnym przejściem.
- Lektor: Piper TTS, polski głos neuronowy `pl_PL-mc_speech-medium` (offline, bez opłat), z kompresją i normalizacją głośności.
- Muzyka: syntetyzowana od zera przez `tools/film-music.py` (bez cudzych nagrań), automatycznie ściszana pod głosem.
- Napisy wypalone w obrazie, plansze animowane w HTML.

## Jak odtworzyć

1. `.env`: `AI_MODE=live`, `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`. Uruchom `npm run dev`.
2. `npx tsx tools/record-film.ts` (ok. 4 płatne tury). Sprawdź w `var/film/markers.json`, że `ok.crash` i `ok.success` są `true`; odpowiedzi modelu różnią się między nagraniami.
3. Narzędzia: `uv venv -p 3.12 var/tts && uv pip install -p var/tts/bin/python piper-tts`, głos: `var/tts/bin/python -m piper.download_voices pl_PL-mc_speech-medium` w `var/film/voice`; ffmpeg: `npm i --prefix var/filmtools ffmpeg-static@5.2.0`.
4. `npx tsx tools/build-film.ts`.
