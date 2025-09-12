function substituteFormula(
  formula: string,
  row: Record<string, unknown>
): string {
  return formula.replace(/\$\.[a-zA-Z0-9_]+/g, (m) => {
    const key = m.slice(2)
    const v = row[key]
    const n = typeof v === 'number' ? v : Number(v)

    return Number.isFinite(n) ? String(n) : '0'
  })
}

function evalSimpleExpression(expr: string): number | undefined {
  const tokens = expr.match(/(\d+(\.\d+)?|[+\-*/])/g)

  if (!tokens || tokens.length === 0) {
    return undefined
  }

  for (let i = 0; i < tokens.length; i += 2) {
    const n = Number(tokens[i])
    if (!Number.isFinite(n)) {
      return undefined
    }

    tokens[i] = String(n)
  }

  const pass1: (string | number)[] = []
  let i = 0
  while (i < tokens.length) {
    if (
      i + 1 < tokens.length &&
      (tokens[i + 1] === '*' || tokens[i + 1] === '/')
    ) {
      const left = Number(tokens[i])
      const op = tokens[i + 1]
      const right = Number(tokens[i + 2])
      const res = op === '*' ? left * right : left / right

      if (!Number.isFinite(res)) {
        return undefined
      }

      tokens.splice(i, 3, String(res))
    } else {
      pass1.push(tokens[i])
      i++
    }
  }

  let result = Number(pass1[0])
  for (let j = 1; j < pass1.length; j += 2) {
    const op = pass1[j]
    const val = Number(pass1[j + 1])

    if (op === '+') {
      result += val
    } else if (op === '-') {
      result -= val
    } else {
      return undefined
    }
  }

  return Number.isFinite(result) ? result : undefined
}

export function evaluateFormula(
  formula: string,
  row: Record<string, unknown>
): number | undefined {
  const substituted = substituteFormula(formula, row)

  return evalSimpleExpression(substituted)
}
