# Experiment 2: RAG Relevance — Learnings

## What Worked
- TF-IDF + synonym bonuses provide meaningful gains over pure keyword search (75% vs 60% avg hit rate)
- Synonym map (10 root words, ~30 synonyms) effectively bridges vocabulary gap for conversational queries
- Vector search wins 6/20, keyword 1/20 — clear advantage for medium/hard difficulty levels
- Russian stemming with suffix removal works adequately for basic normalization
- 16 documents / 44 paragraphs is sufficient corpus size for meaningful differentiation

## Patterns & Conventions
- Followed experiment-1-parser conventions: same file structure (types.ts, corpus.ts, embedder.ts, index.ts), same console output style
- ESM modules with .js extensions in imports
- performance.now() for latency measurement

## Issues
- Q01 ("купить ноутбук в командировке?") → 0% both: verb "купить" vs noun "закупка" vocabulary gap. Real embeddings would fix this.
- Q11 ("поехал к клиенту на своей машине") → 0% both: "машина"/"автомобиль" synonym exists but TF-IDF cosine still too low
- Q15 ("купил коллеге подарок") → 0%/100%: keyword wins because GE-3 has exact "подарок"+"день рождения" match, vector diluted by other terms
- Precision is low (22%/17%) because top-5 returns many marginally-matching paragraphs

## Decisions
- Stemming: single suffix removal (not Porter stemmer) — simpler, sufficient for Russian
- Stop words: 60 common Russian words filtered
- Synonym bonus: 0.15 per synonym pair, 0.1 for multi-synonym density, capped at 0.5
- Difficulty labels: easy=direct terminology, medium=synonyms, hard=ambiguous context
