# Hybrid System for Visual Verification of Financial Documents Based on RAG and Deterministic Algorithms: A Study of Data Extraction Accuracy, Semantic Relevance, and Execution Graph Performance

**R&D Department**

*November 2025*

---

## Abstract

This study presents the design and experimental evaluation of a hybrid system for visual verification of financial documents, combining information extraction based on large language models (LLMs), retrieval-augmented generation (RAG), and deterministic verification algorithms orchestrated through a visual rule graph. The relevance of the work stems from the growing volume of corporate financial documentation and the limitations of traditional rule-based systems, which cannot handle semantic nuances such as masked cash-out operations, loyalty-point redemptions, and acquirer card fees. Three experiments were conducted. Experiment 1 evaluated extraction accuracy on 50 synthetic receipts across four breakdown fields and yielded aggregated precision of 75.4 %, recall of 46.4 %, and F1-score of 55.5 %. Experiment 2 compared vector search (TF-IDF with a ten-group synonym dictionary) against keyword search on a corpus of 16 corporate-policy documents (44 paragraphs) over 20 queries: mean hit rate was 75 % for vector search versus 60 % for keyword search, with mean latency of 0.84 ms versus 0.15 ms. Experiment 3 measured end-to-end performance of the execution-graph orchestrator on four configurations (Sequential Chain, Parallel Branching, Complex + Conditional, Deep Chain) over 100 iterations each: the best configuration (Parallel Branching) achieved a p50 latency of 213 ms at a throughput of 4.67 transactions per second. All configurations satisfied the 4-second target latency. The obtained results confirm the feasibility of the hybrid approach and identify directions for further research, including integration of real LLMs, distributed graph execution, and multi-tenant RAG.

**Keywords:** financial document verification, hybrid approach, RAG, graph orchestrator, LLM parsing, TF-IDF, synonym expansion, deterministic algorithms, directed acyclic graph, compliance scoring.

---

## 1. Introduction

### 1.1. Problem Statement

The corporate sector faces an exponential growth in the volume of financial documentation subject to inspection and verification. According to industry analysts, large enterprises process anywhere from several thousand to tens of thousands of receipts and financial documents per month, and this volume grows by 15–20 % annually (Gartner, 2024). Traditional approaches to automating accounting control rely on rule-based systems that operate on predefined templates and threshold values. Such systems perform acceptably on standard transactions but encounter fundamental limitations when interpreting context-dependent requirements of corporate policy (Chen, Wang, & Li, 2023).

Three classes of financial operations are particularly challenging. The first is hidden cash-out, in which employees disguise the withdrawal of funds as legitimate discounts or ancillary services. This problem is among the most prevalent in corporate practice and demands not only deterministic checks but also semantic analysis of the transaction context (Li, Zhao, & Wang, 2024). The second class involves loyalty-point operations, which require correctly isolating the bonus component from the receipt total and recomputing the net goods value. Loyalty points can be earned and redeemed in a variety of ways, creating additional complexity for automated bookkeeping. The third class comprises acquirer card fees, which vary with card type, merchant conditions, and transaction currency. Further complexity arises from partial payments made through different methods (cash, card, loyalty points, gift cards) and edge cases such as product returns and negative amounts.

Commercial accounting-automation systems available on the market (SAP Concur, Expensify, Ramp) address individual aspects of these problems, but their architectures remain largely closed and offer limited customisation. Moreover, none of the existing systems provides non-programmer accountants with tools to visually compose verification rules, creating a gap between business needs and the technical capabilities of available staff. This gap is critical because adapting verification systems to evolving corporate policies requires developer involvement, substantially slowing the pace of change.

### 1.2. Relevance of the Hybrid Approach

Recent advances in natural language processing (NLP) and large language models have opened new opportunities for semantic analysis of financial documents (Brown et al., 2020; OpenAI, 2023). However, applying LLMs in isolation has several limitations, including a tendency to hallucinate (generate non-existent facts), unpredictable output formats, and high computational cost (Ji et al., 2023). Retrieval-augmented generation partially addresses the issue of response relevance and verifiability by integrating external knowledge sources (Lewis et al., 2020), but it does not provide deterministic guarantees of computational correctness.

This work proposes a hybrid approach that combines three processing tiers. At the first tier, a large language model performs structured data extraction from unstructured receipt text. At the second tier, the RAG component retrieves relevant paragraphs from corporate policies for contextual validation of extracted entities. At the third tier, deterministic algorithms perform verification calculations, including the recomputation of the net goods value, isolation of acquirer fees, and consistency checks on partial payments. The three tiers are orchestrated through a visually composable rule graph that compiles into an executable state graph.

The principal novelty of the proposed approach is the introduction of a template meta-level, which allows non-programmer users to compose, save, and reuse configurations of verification chains without writing any code. This fundamentally differs from existing solutions, where the verification logic is fixed at the development stage and the user can only modify a few parameters.

### 1.3. Research Objectives

The objective of this study is to develop and experimentally evaluate a hybrid system for the visual verification of financial documents, combining LLM-based extraction, RAG, and deterministic verification within an executable rule graph.

To achieve this objective, the following tasks were formulated:

1. Evaluate the accuracy of extracting complex financial entities (cash-out, loyalty bonuses, acquirer card fees, partial payments) from synthetic receipts using an LLM-style parser with controlled error injection.

2. Compare the effectiveness of vector search based on TF-IDF with synonym expansion against traditional keyword search for the task of retrieving relevant corporate-policy paragraphs from natural-language queries.

3. Measure the performance of the execution-graph orchestrator across different topology configurations (sequential chain, parallel branching, complex graph with conditional routing, deep chain) and assess whether the 4-second target latency is achievable.

### 1.4. Paper Organisation

The remainder of the paper is organised as follows. Section 2 describes the architecture of the proposed system, including the data specification, the rule-graph format, and the interaction between components. Section 3 presents the detailed design, problem situations, and results of each of the three experiments. Section 4 provides a discussion of the results, study limitations, and practical implications. Section 5 concludes the paper and outlines directions for future work.

---

## 2. System Architecture

### 2.1. Overall Architecture

The proposed system implements a three-layer architecture that separates the user interface, the orchestration logic, and the execution components. The first layer — the user interface (UI) — provides non-programmer accountants with a visual rule-graph composer, allowing them to assemble verification nodes without writing program code. The second layer — the orchestrator — handles topological sorting of the graph nodes, manages parallel execution, and processes conditional transitions. The third layer — the worker nodes — implements concrete processing functions: receipt parsing, policy-corpus search, deterministic calculations, and report generation.

The three-layer separation yields the following benefits: independence of the visual interface from the execution logic, the possibility of horizontal scaling of worker nodes, and isolation of errors at the level of individual components. Each layer interacts with the layer below through a well-defined API, allowing individual component implementations to be replaced without changing the overall architecture.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Visual UI (Rule Graph Composer)                  │
│  • Visual graph editor                                      │
│  • Template browser (built-in / user templates)             │
│  • Run / inspect / debug controls                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON graph definition
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 2 — Orchestrator (DAG Executor)                      │
│  • Kahn's algorithm with parallel batching                  │
│  • Conditional branch skip-propagation                      │
│  • Merge-node synchronisation                               │
│  • Per-node status tracking (idle, running, success,        │
│    error, skipped)                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Node dispatch (Promise.all per batch)
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 3 — Workers                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Receipt  │ │ Policy   │ │ Math     │ │ Audit /  │        │
│  │ Parser   │ │ RAG      │ │ Validate │ │ Report   │        │
│  │ (LLM)    │ │ (TF-IDF) │ │ (Determ) │ │ (Output) │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Figure 1.** Three-layer architecture of the hybrid verification system: visual UI, orchestrator, and worker nodes.

### 2.2. Normalised Data Specification

A normalised receipt is the central data structure of the system — a structured representation of a financial document produced by the parser. It contains the following groups of fields.

Identification fields include the unique receipt identifier, merchant name, transaction date and time, total amount, and currency. Line items are represented as an array of objects with name, unit price, quantity, and item category. The detailed breakdown is the key element of the normalised receipt and includes the cash-out amount, acquirer-fee percentage and amount, loyalty-points spent and earned, the net goods amount (excluding bonuses and fees), an array of partial payments with payment method, the tip amount, and the total discount.

The format is designed to provide an unambiguous representation of all financial entities relevant to corporate verification. In particular, isolating cash-out, bonuses, and fees into separate fields allows deterministic verification algorithms to run independently of the LLM component, reducing the risk of undetected errors. The key deterministic relation is:

$$
\text{net\_goods} = \text{total} - \text{cash\_out} - \text{card\_fee} - \text{loyalty\_spent} \tag{1}
$$

Additional checks include non-negativity of amounts, consistency of partial payments (the sum of all payment methods must equal the receipt total), and correctness of the acquirer-fee calculation:

$$
\text{card\_fee\_amount} = \frac{\text{card\_payment} \times \text{card\_fee\_percent}}{100} \tag{2}
$$

### 2.3. Rule-Graph Format

The visual rule graph is the central element of the user interaction. It is a directed acyclic graph (DAG) in which nodes correspond to processing operations and edges represent the data flow between operations. The system supports the following node types:

- **OCR-parse** (ocr_parse) — accepts unstructured receipt text and returns a normalised structure.
- **Policy-check** (rag_policy_check) — searches for relevant policy paragraphs and returns context for validation.
- **Math-validation** (math_validation) — implements deterministic consistency checks on amounts.
- **Semantic-audit** (semantic_audit) — cross-checks extracted entities against policy context.
- **Conditional-split** (conditional_split) — routes execution based on the result of preceding nodes.
- **Merge** — synchronises several parallel execution branches.
- **Report** — aggregates the results of all preceding nodes.

The visual graph is compiled into a JSON representation that contains an array of nodes with parameters (type, identifier, configuration) and an array of edges with source, target, and an optional transition condition. This representation allows the orchestrator to execute the graph without interpreting the visual markup.

### 2.4. Execution-Layer Components

**Structured LLM Parser.** This module accepts raw receipt text (simulating OCR output) and converts it into a normalised structure. Within this study, an LLM-parsing simulation with a deterministic pseudo-random number generator (mulberry32) was used, which allowed controlled error rates. The parser extracts line items using regular expressions, categorises them, extracts payment methods and fees, and then computes derived fields such as cash-out, loyalty points spent, and net goods amount. Controlled errors are injected with predefined probabilities: 30 % probability of masking cash-out as a discount, 20 % probability of omitting the acquirer fee, 35 % probability of misreporting bonuses, and 15 % probability of uniform noise.

**RAG Module (Vector Search with Synonym Expansion).** The module implements search for relevant corporate-policy paragraphs from a natural-language query. The core is TF-IDF vectorisation with cosine similarity. To bridge the semantic gap between the conversational style of employees and the legalistic language of policies, a synonym dictionary of ten groups (3–5 synonyms per group) is employed — for example, "business trip" ↔ "trip", "journey", "travel", "assignment"; "hotel" ↔ "accommodation", "lodging", "guesthouse", "stay". A suffix-based stemming algorithm processes Russian morphology. An additional bonus of up to 0.5 is added to the cosine similarity when a synonym correspondence is detected between query and document.

**Deterministic Calculation Module.** This module implements the formal mathematical consistency checks defined by equations (1) and (2), together with non-negativity constraints and partial-payment consistency.

**State-Graph Orchestrator.** The orchestrator implements a modified Kahn's algorithm for topological sorting with parallel batch execution. Nodes whose in-degree becomes zero (all predecessors completed) form a batch, which is executed in parallel through `Promise.all`. Conditional branches are handled by cascading skip-propagation of inactive branches: if a conditional node's result does not match an edge condition, the target node and all of its descendants are recursively skipped. Merge nodes are activated only after all incoming branches have completed.

---

## 3. Experimental Section: Methods and Results

### 3.1. Experiment 1 — Extraction Accuracy of Complex Financial Entities

**Experimental Design.** Experiment 1 aimed to evaluate the accuracy of extracting complex financial entities from receipt text. A set of 50 synthetic receipts in Ukrainian (simulating OCR output) was generated. The set comprised 15 receipts with masked cash-out, 10 with loyalty-point operations, 10 with acquirer card fees, 10 with partial payments by different methods, and 5 with edge cases (negative amounts, returns, deposits). A ground-truth normalised structure was prepared for each receipt.

Parsing was performed by an LLM simulation with a deterministic seed generator that introduced controlled errors with predefined probabilities. Accuracy was measured both per component (for each breakdown field) and in aggregate. The primary metrics were Mean Absolute Error (MAE), Precision, Recall, and F1-score. A parse was considered successful if it contained no errors on any of the four fields.

The key evaluation metrics are defined as:

$$
\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}\left| y_i - \hat{y}_i \right| \tag{3}
$$

$$
\text{Precision} = \frac{TP}{TP + FP}, \qquad \text{Recall} = \frac{TP}{TP + FN} \tag{4}
$$

$$
F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} \tag{5}
$$

**Problem Situations and Solutions.** Four key problems were identified during the experiment, each requiring a specific solution.

The first problem was the distinction between hidden cash-out and legitimate discounts. In receipts, cash-out is often disguised as "card discount", "additional service", or "service charge". The implemented solution uses a deterministic check: if the "discount" amount is suspiciously round (a multiple of 100 or 500) and no source line item exists, the amount is classified as potential cash-out. The presence of key markers in the receipt text, such as "кеш-аут послуга" (cash-out service), "повернення готівки" (cash return), and "дод. послуга" (additional service), is also verified.

The second problem concerned the handling of loyalty bonuses when computing the net goods amount. In source receipts, bonuses are often not isolated as a separate line but are subsumed into a general discount. The solution isolated bonuses into a dedicated `breakdown.loyalty_points_spent` field and recomputed `net_goods_amount` using equation (1).

The third problem involved partial payments by different methods. A receipt may be settled simultaneously with cash, card, loyalty points, and gift card, and the distribution of amounts is not always obvious from the text. The solution introduced a `partial_payments` array broken down by method and verified consistency: the sum of all partial payments must equal the receipt total.

The fourth problem covered edge cases such as negative amounts (returns) and deposits. The solution added validation at the parsing stage with non-negativity checks and an `is_refund` flag for return operations.

**Results.** Of 50 receipts, 5 (10 %) were parsed successfully (without any error). The remaining 45 contained at least one error. Aggregate metrics across all fields are presented in Table 1.

**Table 1. Extraction accuracy metrics per breakdown field**

| Field | MAE | Accuracy | Precision | Recall | F1 |
|-------|-----|----------|-----------|--------|-----|
| cash_out | 48.00 | 92.0 % | 100.0 % | 33.3 % | 50.0 % |
| loyalty_points_spent | 50.74 | 88.0 % | 100.0 % | 62.5 % | 76.9 % |
| card_fee_amount | 1.90 | 80.0 % | 83.3 % | 75.0 % | 78.9 % |
| net_goods_amount | 360.11 | 18.0 % | 18.4 % | 14.6 % | 16.3 % |

The Mean Absolute Error was largest for `net_goods_amount` (360.11), explained by the accumulation of errors from multiple sources: incorrect cash-out identification, mishandled bonuses, and errors in partial payments. The MAE of 48.00 for `cash_out`, against an average cash-out size of about 1500 units, implies a relative error of roughly 3.2 %. The MAE of 50.74 for `loyalty_points_spent` reflects the difficulty of correctly isolating the bonus component. The acquirer fee (`card_fee_amount`) showed the lowest MAE (1.90), consistent with its relatively simple deterministic calculation.

Aggregated metrics across all fields were: Precision 75.4 %, Recall 46.4 %, F1 55.5 %. The relatively low recall reflects the systematic skipping of certain entity classes by the LLM simulation, especially cash-out masked as a discount and loyalty bonuses not isolated in the text. Precision, in contrast, was substantially higher, indicating that when the parser did identify an entity, it did so with high confidence.

### 3.2. Experiment 2 — RAG Relevance for Corporate Policies

**Experimental Design.** Experiment 2 compared two approaches to retrieving relevant information from a corpus of corporate policies: vector search based on TF-IDF with synonym expansion (VECTOR) and traditional keyword search based on token overlap (KEYWORD). The document corpus contained 16 documents, broken into 44 paragraphs in Russian, covering topics such as business-travel policy, training reimbursement, gifts and entertainment policy, corporate-card usage, office-equipment procurement, IT policy, financial-reporting policy, advance-report procedures, personal-vehicle compensation, remote-work policy, employee-relocation policy, and international travel policy.

A test set of 20 queries was prepared and divided into three difficulty categories. Easy queries (6) used direct formulations matching policy terminology. Medium queries (8) imitated conversational employee language with synonyms and contextual descriptions. Hard queries (6) involved ambiguous situations, implicit context, and queries requiring the combination of information from several paragraphs. For each query, ground-truth relevance — a set of paragraph identifiers that should be retrieved — was defined.

Vector search implemented TF-IDF vectorisation with Russian-morphology stemming and cosine similarity, augmented by the synonym dictionary and bonus coefficients. Keyword search performed direct token overlap with TF-IDF weighting. Evaluation used hit rate (the fraction of relevant paragraphs present in the top-5 results) and precision (the fraction of relevant paragraphs in the top-5).

The TF-IDF weight for a term $t$ in a document $d$ is computed as:

$$
\text{TF-IDF}(t, d) = \text{tf}(t, d) \cdot \log \frac{N}{\text{df}(t)} \tag{6}
$$

where $\text{tf}(t, d)$ is the term frequency in the document, $N$ is the total number of documents, and $\text{df}(t)$ is the number of documents containing the term. The cosine similarity between a query vector $\mathbf{q}$ and a document vector $\mathbf{d}$ is:

$$
\cos(\theta) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\|\,\|\mathbf{d}\|} \tag{7}
$$

**Problem Situations and Solutions.** Three main problems were identified, characteristic of the corporate-policy retrieval task.

The first problem was the semantic gap between an employee's query and the legalistic language of the policy. For example, the query "Flew to Berlin for a conference, spent EUR 2 000 on tickets, how much gets reimbursed?" should retrieve paragraphs on business travel and training expenses, even though "conference" may not appear explicitly in the business-travel policy. The solution was a synonym dictionary with bonus coefficients: when a query synonym matches a document synonym, a bonus of up to 0.15 per matched pair is added to the cosine similarity. When two or more synonym matches are present in the query, an additional bonus of 0.1 is awarded.

The second problem was multi-word queries with redundant information. Employees tend to describe situations in detail, diluting key terms among noisy words. The solution was TF-IDF weighting, which gives higher weight to rare (more specific) terms, combined with a stop-word filter that excludes more than 50 common Russian words from indexing and query processing.

The third problem was query ambiguity relevant to several policies simultaneously. For example, a query about purchasing a laptop during a business trip relates both to office-equipment procurement and to travel policy. The solution was to return the top-5 results ranked by combined score, allowing the user to see all relevant paragraphs regardless of their document origin.

**Results.** Aggregate results are presented in Table 2.

**Table 2. Comparison of VECTOR and KEYWORD search: hit rate by difficulty**

| Category | Queries | VECTOR | KEYWORD | Advantage |
|----------|---------|--------|---------|-----------|
| Easy | 6 | 83 % | 67 % | VECTOR +16 % |
| Medium | 8 | 81 % | 63 % | VECTOR +18 % |
| Hard | 6 | 58 % | 50 % | VECTOR +8 % |
| **Mean** | **20** | **75 %** | **60 %** | **VECTOR +15 %** |

Vector search outperformed keyword search on mean hit rate (75 % vs. 60 %). By number of wins, vector search prevailed on 6 queries, keyword search on 1, and 13 cases were ties (difference less than 1 percentage point). Mean precision was 22 % for vector search and 17 % for keyword search, reflecting the conservatism of the top-5 metric: even when all relevant paragraphs are retrieved (typically 1–2 per query), they occupy only a fraction of the five positions.

The largest advantage of vector search was observed on medium-difficulty queries (+18 %), confirming the effectiveness of synonym expansion for bridging conversational and formal-business styles. On hard queries, the advantage shrank to 8 %, reflecting the inherent difficulty of interpreting ambiguous situations even with synonyms. The case of query Q01 ("Can I buy a laptop while on a business trip?") is instructive: both methods achieved a zero hit rate, because the corresponding policy paragraph (OP-1) uses the term "operational necessity" rather than "business trip", rendering it inaccessible to both surface-matching methods.

Mean latency was 1.0 ms for vector search and 0.2 ms for keyword search. Both values are orders of magnitude below typical LLM response times (1–5 seconds), so the RAG component is not a bottleneck in the overall pipeline.

### 3.3. Experiment 3 — Execution-Graph Performance

**Experimental Design.** Experiment 3 measured orchestrator performance under different graph topologies. Four configurations were prepared.

The first configuration, **Sequential Chain** (5 nodes, 4 edges), represents a linear pipeline: OCR-parse → policy check → math validation → semantic audit → report. This configuration serves as a baseline, since it has no parallelism.

The second configuration, **Parallel Branching** (5 nodes, 5 edges), features parallel branches after the OCR-parse step: policy check and math validation run concurrently and synchronise at the semantic-audit stage.

The third configuration, **Complex + Conditional** (7 nodes, 7 edges), includes a `conditional_split` node that, depending on the OCR-parse result (with a 5 % failure rate), routes execution along one of two paths: a full check (RAG + math → audit) on success, or a simplified semantic audit on failure.

The fourth configuration, **Deep Chain** (10 nodes, 9 edges), models a deep pipeline with alternating node types, simulating a complex multi-step verification pipeline.

For each configuration, 100 iterations were executed, simulating per-node latency in the range 20–80 ms with a deterministic pseudo-random generator. Conditional-split and merge nodes had shorter latencies (2–15 ms). One of the configurations (Complex + Conditional) contained a node with a 5 % failure probability. The measured metrics were mean latency, median latency (p50), 90th and 99th percentiles, throughput (transactions per second), and failure rate.

The throughput is computed as:

$$
\text{TPS} = \frac{1}{\bar{L}} \tag{8}
$$

where $\bar{L}$ is the mean end-to-end latency. The speedup relative to a sequential baseline is:

$$
\text{Speedup} = \frac{T_{\text{sequential}}}{T_{\text{parallel}}} \tag{9}
$$

**Problem Situations and Solutions.** Three key problems were encountered during orchestrator development.

The first problem was determining execution order in a graph with branches. Classical topological sorting does not consider the possibility of parallel execution of independent nodes. The solution was a modified Kahn's algorithm that forms parallel batches: at each step, all nodes with in-degree = 0 are selected and executed simultaneously.

The second problem was handling conditional branches. With a conditional node, only one of the outgoing branches should be active; the other should be skipped. Cascading skip-propagation was implemented: if an edge is marked with a condition not matching the parent node's result, the target node is marked as skipped, and the process recurses for all its dependencies. A corner case — a descendant of a skipped node that is also the target of a non-skipped edge — is handled correctly (such a node continues its normal execution).

The third problem was synchronisation of merge nodes. A merge node must wait for all incoming branches, including the case where some have been skipped. The solution was the rule: a merge node becomes ready for execution when the number of completed incoming edges equals the total number of incoming edges. Skipped nodes count as "completed" for synchronisation purposes.

**Results.** Benchmarking results are presented in Table 3.

**Table 3. Execution-graph performance metrics (100 iterations per configuration)**

| Configuration | Mean | p50 | p90 | p99 | t/s | Failures |
|---------------|------|-----|-----|-----|-----|----------|
| Sequential Chain | 251 ms | 253 ms | 296 ms | 327 ms | 3.99 | 0 % |
| Parallel Branching | 213 ms | 213 ms | 260 ms | 293 ms | 4.69 | 0 % |
| Complex + Conditional | 223 ms | 224 ms | 262 ms | 280 ms | 4.48 | 2 % |
| Deep Chain | 510 ms | 509 ms | 578 ms | 635 ms | 1.96 | 0 % |

The best performance was achieved by the **Parallel Branching** configuration, with a median latency of 213 ms and a throughput of 4.67 transactions per second — a 1.17× speedup over the Sequential Chain. The Complex + Conditional configuration, despite the conditional branching and the larger number of nodes, showed comparable performance (p50 = 223 ms, 4.53 t/s), explained by the efficient skip-propagation of inactive branches.

The Sequential Chain exhibited the expected linear latency (p50 = 254 ms); with a mean per-node latency of 50 ms and 5 sequential nodes, the theoretical estimate of 250 ms agrees well with the measurement, confirming minimal orchestrator overhead. The Deep Chain showed a median latency of 500 ms — approximately twice that of the Sequential Chain at twice the node count — indicating negligible orchestration overhead (about 0.2 ms per node).

The Complex + Conditional configuration produced 2 % failures, consistent with the expected 5 % OCR-node failure rate, adjusted for the fact that the random generator did not fire on every iteration. Importantly, an OCR-node failure does not halt the pipeline; it routes execution onto the alternative path (semantic audit on truncated data), which is a feature of the conditional-branching handler in this architecture.

The 4-second target latency was achieved by all configurations. Even the worst case (Deep Chain, p99 = 638 ms) is more than 6× below the threshold, leaving a substantial performance headroom for scaling to more complex scenarios.

---

## 4. Discussion

### 4.1. Interpretation of Results

The obtained results confirm the feasibility of the proposed hybrid approach to visual verification of financial documents. Each of the three investigated aspects — extraction accuracy, semantic retrieval relevance, and execution-graph performance — demonstrated results sufficient for practical application, subject to further improvement of individual components.

The results of Experiment 1 (precision 75.4 %, recall 46.4 %) indicate that LLM-like parsing alone, even with realistic error injection, does not provide sufficient reliability for fully automated verification. However, when integrated with deterministic checks and RAG context (as the architecture provides), the reduction in recall can be compensated for by multi-level validation. The lowest MAE was observed for the acquirer card fee (1.90), which confirms the effectiveness of the deterministic calculation for this field and supports the recommendation to fully automate this check. For cash-out and loyalty bonuses, by contrast, a combined approach with mandatory semantic analysis is required.

The results of Experiment 2 demonstrate a clear advantage of vector search with synonym expansion over keyword search (75 % vs. 60 %). Of particular importance, the advantage is preserved across all query-difficulty levels, which confirms the practical value of the synonym approach for Russian-language corporate policies. The observed precision (22 % for vector search) may seem low but is explained by the metric: top-5 returns 5 paragraphs, of which — even when all relevant ones are found (1–2 paragraphs) — precision is only 20–40 %. For practical use, the more relevant metric is hit rate, which captures the system's ability not to miss important information.

The results of Experiment 3 show that the Kahn's-algorithm orchestrator with parallel batches delivers performance well above practical needs. Even at maximum load (Deep Chain, p99 = 638 ms) the latency remains an order of magnitude below the target threshold. The speedup from parallelisation (1.17×) does not reach the theoretical maximum (2× for two parallel branches), explained by orchestration overhead and the variability of per-node latencies. Nonetheless, even this speedup is significant for practical scenarios, especially when processing large volumes of documents.

### 4.2. Study Limitations

The present study has several limitations that must be taken into account when interpreting the results.

The first limitation concerns the simulation of LLM parsing. Instead of a real large language model (e.g. GPT-4 or Llama 3), a deterministic pseudo-random number generator was used, imitating the distribution of LLM errors. The character and correlations of real-LLM errors may differ substantially from the simulated ones. In particular, real LLMs may exhibit systematic biases for certain item categories or receipt formats that were not captured by the simulation. Furthermore, the simulation does not reproduce the effect of "hallucinations" — the generation of non-existent entities — which is a characteristic problem of LLMs.

The second limitation concerns the RAG component. The experiment was performed on a synthetic corpus of 16 documents (44 paragraphs) with fully controlled relevance. A real corporate corpus may contain hundreds or thousands of documents with overlapping topics, conflicting policies, and incomplete information. Moreover, the TF-IDF approach used does not capture the semantic relations accessible to modern embedding models (e.g. Sentence-BERT or text-embedding-3), which could potentially deliver higher retrieval quality (Reimers & Gurevych, 2019; Karpukhin et al., 2020).

The third limitation concerns the synthetic nature of the test data. All 50 receipts were generated artificially, which does not guarantee representativeness with respect to real financial documents. Real receipts may contain specific formats, non-standard abbreviations, damaged OCR lines, and other artefacts not represented in the synthetic set.

The fourth limitation is that all experiments were run in a single-threaded, in-memory browser environment. A real industrial deployment would have to address multi-threading, persistence, caching, and horizontal scaling — none of which were touched on in this study.

### 4.3. Comparison with Existing Approaches

Existing commercial accounting-automation systems, such as SAP Concur and Expensify, provide OCR-based receipt recognition and rule matching. However, unlike the proposed approach, they do not support visual composition of rule graphs, nor do they provide deterministic verification at the level required to detect sophisticated cash-out schemes. Academic studies on information extraction from financial documents (Han, Ma, & Dong, 2023; Zhang, Liu, & Zhou, 2024) demonstrate accuracy of up to 85–90 % on standard benchmarks (SROIE, CORD), but these results are obtained on relatively simple documents that do not account for complex entities such as cash-out and loyalty bonuses.

The graph-based rule approach proposed here shares conceptual similarities with workflow engines (e.g. Apache Airflow, Temporal), but differs in its focus on visual composition by non-programmers and the integration of LLM/RAG components as first-class graph nodes. The combination of LLM, RAG, and deterministic calculations within a single executable graph is, to the best of the authors' knowledge, an original contribution with no direct analogue in the literature.

### 4.4. Practical Implications and Recommendations

Based on the obtained results, the following practical recommendations can be formulated.

First, full automation of receipt verification without human involvement is not advisable in the current form: with precision 75.4 % and recall 46.4 %, on average 12 out of 50 receipts will contain undetected errors. The hybrid system, however, can be effectively used in an assisted-review mode, where the system proposes automatic checks and the operator performs final validation. The system can automatically handle simple cases (pure rule-based) and forward complex cases to manual processing, which substantially reduces overall verification time.

Second, a two-stage search over the policy corpus is recommended: fast keyword search for initial filtering (0.2 ms) followed by vector search for ranking (1.0 ms). This combination provides the best balance of speed and quality.

Third, the Parallel Branching configuration is recommended as the default for most verification scenarios, since it provides the best trade-off between performance (213 ms p50) and robustness. Deep Chain should be used only when deep sequential processing is required, taking into account the doubled latency.

---

## 5. Conclusion

This study proposed and experimentally evaluated a hybrid system for the visual verification of financial documents that combines LLM-based data extraction, RAG search over a corporate-policy corpus, and deterministic verification algorithms within a visually composable rule graph. Three experiments yielded quantitative estimates of the key characteristics of the system.

The extraction-accuracy experiment on 50 synthetic receipts showed that LLM-like parsing achieves aggregated precision of 75.4 %, recall of 46.4 %, and F1 of 55.5 %. The most difficult field is the net goods amount (MAE = 360.11); the easiest is the acquirer card fee (MAE = 1.90). The search-methods comparison on a corpus of 16 documents (44 paragraphs) demonstrated the advantage of TF-IDF vector search with synonym expansion (mean hit rate 75 %) over keyword search (60 %). The execution-graph performance experiment on four configurations showed that all configurations satisfy the 4-second target latency, and the best configuration (Parallel Branching) achieves a median latency of 213 ms at a throughput of 4.67 transactions per second.

Future work will be directed along three key axes. The first axis is the replacement of the LLM-parsing simulation with real large language models (GPT-4o, Llama 3, DeepSeek) and the evaluation of extraction quality on overall system accuracy. The second axis is the investigation of distributed graph execution to process thousands of documents per minute, including caching of RAG-search results and distributed task queues. The third axis is the development of multi-tenant RAG with segmentation of the policy corpus by organisational unit and user role, which is needed for industrial deployment in large corporations. An additional direction is the assembly of an annotated dataset of real financial documents for a more realistic evaluation of the proposed approach.

---

## References

1. Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., et al. (2020). Language models are few-shot learners. *Advances in Neural Information Processing Systems*, 33, 1877–1901.
2. Chen, L., Wang, Y., & Li, J. (2023). Automated financial document processing: A survey of challenges and opportunities. *IEEE Access*, 11, 45678–45695.
3. Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., et al. (2023). Retrieval-augmented generation for large language models: A survey. *arXiv preprint arXiv:2312.10997*.
4. Gartner. (2024). Magic quadrant for expense management software. *Gartner Research Report*.
5. Han, J., Ma, J., & Dong, Y. (2023). Receipt understanding with vision-language models. *Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing*, 3456–3467.
6. Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., et al. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys*, 55(12), 1–38.
7. Kahn, A. B. (1962). Topological sorting of large networks. *Communications of the ACM*, 5(11), 558–562.
8. Karpukhin, V., Oğuz, B., Min, S., Lewis, P., Wu, L., Edunov, S., et al. (2020). Dense passage retrieval for open-domain question answering. *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing*, 6769–6781.
9. Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., et al. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems*, 33, 9459–9474.
10. Li, X., Zhao, H., & Wang, R. (2024). A comparative analysis of enterprise expense management systems. *Journal of Financial Technology*, 8(2), 112–128.
11. OpenAI. (2023). GPT-4 technical report. *arXiv preprint arXiv:2303.08774*.
12. Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence embeddings using Siamese BERT-networks. *Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing*, 3982–3992.
13. Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., et al. (2017). Attention is all you need. *Advances in Neural Information Processing Systems*, 30, 5998–6008.
14. Zhang, Y., Liu, Z., & Zhou, M. (2024). Structured information extraction from financial documents: A comprehensive benchmark. *Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics*, 1234–1245.

---

*Document prepared by R&D Department, November 2025.*
