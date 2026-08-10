// Input Analysis pipeline — must-have checklist (defines "done").
// Turns the desired output into testable items; verification checks each.
export function deriveMustHaves(message: string, desiredOutput?: string): string[] {
  const t = message.toLowerCase()
  const out: string[] = []
  if (/\bbutton\b/.test(t) || /\bclick|press\b/.test(t)) {
    out.push('button renders')
    out.push('click action wired to a function')
    out.push('the function calls its backend/API (if any)')
  }
  if (/\bapi\b/.test(t) || /\bendpoint|backend\b/.test(t)) {
    out.push('API/endpoint exists')
    out.push('API responds to a request (runtime probe)')
  }
  if (/\bform\b/.test(t)) {
    out.push('form renders')
    out.push('form submits and validates')
  }
  if (/\bpage|screen|view\b/.test(t)) {
    out.push('page/screen renders')
  }
  if (/\bfix|debug\b/.test(t)) {
    out.push('the reported issue is resolved')
    out.push('no regression (tests pass)')
  }
  if (/\bfeature|build|create|add\b/.test(t)) {
    out.push('the feature exists and is reachable')
    out.push('tests verify it works')
  }
  if (desiredOutput && desiredOutput !== 'not specified') {
    out.push(`deliverable: ${desiredOutput}`)
  }
  if (out.length === 0) out.push('the requested outcome is met')
  return Array.from(new Set(out))
}
