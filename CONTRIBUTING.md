# Contributing to FCGBDS

Thanks for helping improve FCGBDS.

## Ground rules

1. Keep changes security-focused and production-practical.
2. Avoid breaking defaults in `.env.example` unless required.
3. Preserve placeholder safety (do not add private hostnames or secrets).
4. Include tests or reproduction notes for bug fixes.

## Development flow

1. Fork the repository.
2. Create a feature branch.
3. Make scoped changes.
4. Run local checks:
   - `npm run build`
   - `npm run benchmark:quick` (optional)
5. Open a pull request with:
   - Problem statement
   - What changed
   - How to test
   - Any risk notes

## PR quality checklist

1. No secrets, tokens, or private infra values.
2. Updated README/docs when behavior changes.
3. Backward compatibility documented for breaking changes.
4. Log output does not leak sensitive request data.

## Suggested contribution areas

1. New bot-signal heuristics with low false positives.
2. Better challenge strategies for edge traffic.
3. Platform integration templates.
4. Performance optimizations and benchmark reports.
5. Dashboard observability improvements.
