# GPT-6 Luna z Extra High w Naucz Pilota

Backend i runnery korzystają z tej samej konfiguracji. OpenAI Docs potwierdzają obsługę Responses API, Structured Outputs i `reasoning.effort: xhigh` przez `gpt-6-luna`. Sprawdzenie z lokalną atrapą potwierdziło wysłanie tych parametrów przez SDK. Dostęp do modelu na koncie, odpowiedzi i czasy prawdziwego API pozostają **NOT RUN**. [Model GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).

## Uruchomienie lokalne

Ustaw poniższe zmienne w `.env` w katalogu projektu. Istniejący `OPENAI_API_KEY` jest odczytywany przez backend.

```dotenv
AI_MODE=live
AI_MODEL=gpt-6-luna
AI_REASONING_EFFORT=xhigh
AI_MAX_OUTPUT_TOKENS=8192
AI_TURN_TIMEOUT_MS=90000
```

Uruchom `npm run dev` i otwórz `http://127.0.0.1:5173`. Vite przekazuje `/api` do Express na porcie 3001. Przy korzystaniu ze zbudowanej aplikacji użyj `npm run build`, a następnie `PUBLIC_ORIGIN=http://127.0.0.1:3001 npm start` i otwórz `http://127.0.0.1:3001`. W ustawieniach gry wybierz live przed zatwierdzoną próbą. `/api/health` sprawdza lokalną konfigurację i nie wykonuje tury u dostawcy.

Limit 8192 obejmuje widoczną odpowiedź oraz rozumowanie. Backend daje całej turze 90 s, maksymalnie 120 s według ustawienia. Relay Electrona i narzędzia przeglądarkowe oczekują do 130 s na turę. Produkcyjne proxy dla `/api/learner-turn` powinno mieć co najmniej 130 s na odpowiedź. Gra pokazuje oczekiwanie i pozwala zmienić widok. Po timeout lub `incomplete` zwraca jawny błąd. [Rozumowanie i budżet tokenów w OpenAI Docs](https://developers.openai.com/api/docs/guides/reasoning#controlling-costs).

## Próba z atrapą i dowód HTTP

[Pełne body odebrane przez lokalną atrapę](../checks/luna-xhigh-http-stub-request.json) zawiera syntetyczną lekcję, prompt, schemat i parametry SDK. W zapisie uwzględniono wyłącznie body. Aby odtworzyć zapis, uruchom:

```sh
mkdir -p var
PIKO_CAPTURE_LUNA_HTTP_BODY=var/luna-xhigh-http-stub-request.json npm test -- tests/provider.test.ts
```

Test sprawdza także `AI_NOT_CONFIGURED` dla odrzuconego parametru i niedostępnego modelu, `AI_INCOMPLETE` dla odpowiedzi uciętej przez limit oraz pojedyncze żądanie na każdą próbę. Kod aplikacji zachowuje kontrakt notatki jako danych w roli `user` i niezależną walidację lotu.

## Porównanie M04 po osobnej zgodzie

**NOT RUN.** Porównaj Lunę z [rzeczywistym przebiegiem GPT-5.4 mini](../checks/ai-live-m04-abc-1.1.0.md) przy tym samym prompcie 1.1.0 i tej samej geometrii. Poniższa komenda jest przeznaczona do uruchomienia po zatwierdzeniu wydatków. Utworzy trzy osobne sesje z identycznego stanu, każdą z jedną turą teach i jedną turą transferu. Ustawienie jednej próby wyłącza techniczne ponowienie i ogranicza budżet runnera na granicy HTTP do sześciu żądań.

```sh
AI_MODEL=gpt-6-luna AI_REASONING_EFFORT=xhigh AI_MAX_OUTPUT_TOKENS=8192 \
  AI_TURN_TIMEOUT_MS=90000 AI_MAX_PROVIDER_REQUESTS_PER_TURN=1 \
  npx tsx tests/live/m04-browser.ts --allow-paid luna-m04-pierwsza-proba
```

Przy sześciu żądaniach limit wyjścia wynosi łącznie 49 152 tokeny, czyli najwyżej 0,024576 USD za wyjście przy stawce Standard 0,50 USD za milion tokenów wyjściowych. Koszt wejścia dochodzi osobno według faktycznego zużycia i danych o cache. Zapisz model zwrócony przez API, tokeny, czasy teach i transferu, wypowiedzi, wzory i wyniki silnika. Porównaj, czy A przenosi zasadę na nową geometrię, B odrzuca błędne zdanie, a C wskazuje brak wskazówki. [Stawki GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna#pricing).
