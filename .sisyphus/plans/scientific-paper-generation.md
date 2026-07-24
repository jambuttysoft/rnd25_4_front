# Plan: Generate Scientific Research Paper

## TL;DR
Generate a ~20-page scientific research paper in Russian on "Automation of constructing verification systems based on templates" saved to `docs/scientific-paper.md`. Paper covers: advantages of template-based approach, 3 experiments with focus on Experiments 2 (RAG) and 3 (Performance), challenges encountered and solutions.

## Execution Strategy
Single task — write the scientific paper as a markdown document.

## Task
- [ ] 1. Generate the scientific paper

  **What to do**: Write a comprehensive ~20 page scientific research paper in Russian as `docs/scientific-paper.md`. The paper must:
  - Cover the template-based verification system approach with focus on advantages
  - Describe all 3 experiments (Parser, RAG, Performance) in detail
  - Focus particularly on Experiment 2 (RAG relevance) and Experiment 3 (Graph performance)
  - Describe challenges encountered during each experiment and how they were overcome
  - Reference the actual experiment data from `src/data/parserData.ts`, `src/data/ragData.ts`, `src/data/perfData.ts`
  - Reference the actual experiment implementations from `src/experiments/`
  - Follow IMRAD structure with Russian-language academic style
  - Include tables for key results, a literature review section, and discussion of limitations
  - Target approximately 20 pages (10,000-12,000 words / 60,000+ chars)
  - Reference the existing R&D report from `docs/rnd-report.md` for context
  - Include the advantages of template-based approach section prominently

  **Key content from experiments to include**:
  - Exp1: 50 synthetic receipts, 4 fields, MAE/Precision/Recall/F1 metrics, cash-out masking challenges
  - Exp2: 20 queries, 16 policy documents, VECTOR vs KEYWORD comparison, synonym dictionary challenges
  - Exp3: 4 graph configurations, 100 iterations each, parallel branching performance, topological sorting challenges
  - Template system: 8 module types, 3 built-in presets, save/edit/delete user templates

  **Agent-Executed QA Scenarios**:
  1. Verify file exists at `docs/scientific-paper.md` with minimum 60,000 characters
  2. Verify paper follows IMRAD structure (Introduction, Methods, Results, Discussion)
  3. Verify all 3 experiments are described with actual data from source files
  4. Verify challenges section is present with specific problems and solutions
  5. Verify advantages section is present with clear articulation of template-based approach benefits

  **Recommended Agent Profile**: `writing` category with scientific-writing skill

  **References** (read these first):
  - `src/data/parserData.ts` — Parser experiment data
  - `src/data/ragData.ts` — RAG experiment data
  - `src/data/perfData.ts` — Performance benchmark data
  - `src/experiments/Experiment1Parser.tsx` — Experiment 1 implementation
  - `src/experiments/Experiment2Rag.tsx` — Experiment 2 implementation
  - `src/experiments/Experiment3Perf.tsx` — Experiment 3 implementation
  - `docs/rnd-report.md` — Existing R&D report in Russian
  - `src/types/pipeline.ts` — Pipeline type definitions
  - `src/state/PipelineContext.tsx` — State management
  - `src/components/pipeline/TemplateManager.tsx` — Template system implementation
  - `src/utils/pipeline/execute.ts` — Pipeline execution engine

  **Commit**: YES
  - Message: `feat(docs): add 20-page scientific research paper on template-based verification automation`
  - Files: `docs/scientific-paper.md`
