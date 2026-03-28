// CPM benchmarks by industry (USD)
const CPM_BENCHMARKS: Record<string, { min: number; max: number }> = {
  ecommerce:  { min: 8,  max: 20  },
  travel:     { min: 10, max: 25  },
  tech:       { min: 12, max: 30  },
  education:  { min: 6,  max: 15  },
  fintech:    { min: 15, max: 40  },
  fitness:    { min: 8,  max: 18  },
  default:    { min: 8,  max: 20  },
}

// Estimated daily impressions by performance score
function estimateImpressions(score: number): { min: number; max: number } {
  if (score >= 85) return { min: 50000,  max: 200000  }
  if (score >= 65) return { min: 20000,  max: 80000   }
  if (score >= 40) return { min: 5000,   max: 20000   }
  return                  { min: 1000,   max: 5000    }
}

export function estimateSpend(
  score: number,
  industry = 'default',
  daysActive = 1
): { min: number; max: number } {
  const cpm = CPM_BENCHMARKS[industry] ?? CPM_BENCHMARKS.default
  const impressions = estimateImpressions(score)
  const minDaily = Math.round((impressions.min / 1000) * cpm.min)
  const maxDaily = Math.round((impressions.max / 1000) * cpm.max)
  return {
    min: minDaily * daysActive,
    max: maxDaily * daysActive,
  }
}

export function formatSpend(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
  return `${fmt(min)}–${fmt(max)}/day`
}
