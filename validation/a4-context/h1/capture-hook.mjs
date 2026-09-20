import { createHash, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const LIMIT = 1024 * 1024;
const SKILL = 'superpowers:brainstorming';
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function diagnostic(code) {
  try { writeFileSync(2, `${code}\n`); } catch { /* A closed stderr must not block the original tool. */ }
}

function configuration(args) {
  const values = new Map();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--out-dir', '--run-id', '--marker'].includes(key) || values.has(key) || !args[i + 1]) throw new Error();
    values.set(key, args[i + 1]);
  }
  const outDir = values.get('--out-dir');
  const runId = values.get('--run-id');
  const marker = values.get('--marker');
  if (values.size !== 3 || !isAbsolute(outDir) || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(runId) || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(marker)) throw new Error();
  return { outDir, runId, marker };
}

async function readInput() {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size <= LIMIT) chunks.push(chunk);
    else chunks.length = 0;
  }
  // Drain oversized stdin without retaining it, avoiding a broken pipe for the host.
  if (size > LIMIT) return null;
  return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
}

function sanitize(input) {
  const result = { field_names: Object.keys(input) };
  for (const name of ['hook_event_name', 'tool_name', 'command_name', 'command_source', 'expansion_type', 'cwd']) {
    if (typeof input[name] === 'string') result[name] = input[name];
  }
  for (const name of ['session_id', 'tool_use_id']) {
    if (typeof input[name] === 'string') result[`${name}_sha256`] = createHash('sha256').update(input[name]).digest('hex');
  }
  if (isObject(input.tool_input)) {
    const entries = Object.entries(input.tool_input);
    result.tool_input = {
      field_names: entries.map(([key]) => key),
      field_types: Object.fromEntries(entries.map(([key, value]) => [key, value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value])),
    };
    if (typeof input.tool_input.skill === 'string') result.tool_input.skill = input.tool_input.skill;
  }
  return result;
}

async function main() {
  let config;
  try { config = configuration(process.argv.slice(2)); }
  catch { diagnostic('H1_ARGUMENT_ERROR'); return; }

  let input;
  try {
    const text = await readInput();
    if (text === null) { diagnostic('H1_INPUT_TOO_LARGE'); return; }
    input = JSON.parse(text);
    if (!isObject(input) || typeof input.hook_event_name !== 'string') throw new Error();
  } catch { diagnostic('H1_INPUT_ERROR'); return; }

  const event = input.hook_event_name;
  const skillEvent = event === 'PreToolUse' && input.tool_name === 'Skill';
  const expansionEvent = event === 'UserPromptExpansion';
  const matched = (skillEvent && isObject(input.tool_input) && input.tool_input.skill === SKILL)
    || (expansionEvent && input.command_name === SKILL);
  const unsupported = !['PreToolUse', 'UserPromptExpansion'].includes(event)
    || (event === 'PreToolUse' && typeof input.tool_name !== 'string')
    || (skillEvent && (!isObject(input.tool_input) || typeof input.tool_input.skill !== 'string'))
    || (expansionEvent && typeof input.command_name !== 'string');
  const response = matched ? { hookSpecificOutput: {
    hookEventName: event,
    additionalContext: `H1_PROTOCOL_PROBE: ${config.marker}. This is a diagnostic marker, not evidence that project documents were read.`,
  } } : null;
  const record = {
    run_id: config.runId,
    runtime: { node_version: process.version, process_cwd: process.cwd() },
    input: sanitize(input),
    decision: matched ? 'injected' : 'skipped',
    response,
  };
  try {
    // Persist before stdout: a capture failure must not masquerade as success.
    writeFileSync(join(config.outDir, `${config.runId}-${randomUUID()}.json`), `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  } catch { diagnostic('H1_WRITE_ERROR'); return; }
  if (unsupported) diagnostic('H1_UNSUPPORTED_INPUT');
  if (response) {
    try { writeFileSync(1, `${JSON.stringify(response)}\n`); }
    catch { diagnostic('H1_STDOUT_ERROR'); }
  }
}

// No hook failure should deny or block the original operation.
main().catch(() => diagnostic('H1_INTERNAL_ERROR'));
