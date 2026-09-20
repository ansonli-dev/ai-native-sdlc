import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, realpathSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const script = fileURLToPath(new URL('./capture-hook.mjs', import.meta.url));
const marker = 'fixture-marker-91a';
const target = { hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill: 'superpowers:brainstorming' } };

function fixture(t) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'h1 collector ')));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function invoke(dir, payload, args = ['--out-dir', dir, '--run-id', 'fixture-run', '--marker', marker]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: dir, input: typeof payload === 'string' || Buffer.isBuffer(payload) ? payload : JSON.stringify(payload),
    encoding: 'utf8', timeout: 5000, maxBuffer: 2 ** 22,
  });
}

function records(dir) {
  return readdirSync(dir).filter(name => name.endsWith('.json')).map(name => JSON.parse(readFileSync(join(dir, name), 'utf8')));
}

function normal(result) {
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
}

for (const [event, payload] of [
  ['PreToolUse', target],
  ['UserPromptExpansion', { hook_event_name: 'UserPromptExpansion', command_name: 'superpowers:brainstorming', command_source: 'plugin', expansion_type: 'skill' }],
]) {
  test(`injects exact ${event} route and persists the same response`, t => {
    const dir = fixture(t);
    const result = invoke(dir, payload);
    normal(result);
    const response = JSON.parse(result.stdout);
    assert.deepEqual(response, { hookSpecificOutput: {
      hookEventName: event,
      additionalContext: `H1_PROTOCOL_PROBE: ${marker}. This is a diagnostic marker, not evidence that project documents were read.`,
    } });
    const [record] = records(dir);
    assert.equal(records(dir).length, 1);
    assert.equal(record.decision, 'injected');
    assert.deepEqual(record.response, response);
    assert.equal(record.input.hook_event_name, event);
    assert.deepEqual(record.input.field_names, Object.keys(payload));
    if (event === 'UserPromptExpansion') {
      assert.equal(record.input.command_name, 'superpowers:brainstorming');
      assert.equal(record.input.command_source, 'plugin');
      assert.equal(record.input.expansion_type, 'skill');
    }
    assert.equal(record.runtime.node_version, process.version);
    assert.equal(record.runtime.process_cwd, dir);
  });
}

test('namespace, suffix, case, tool name and cross-event lookalikes never inject', t => {
  const dir = fixture(t);
  const inputs = [
    ...['other:brainstorming', 'brainstorming', 'superpowers:brainstorming-extra', 'superpowers:Brainstorming'].flatMap(skill => [
      { ...target, tool_input: { skill } },
      { hook_event_name: 'UserPromptExpansion', command_name: skill },
    ]),
    { ...target, tool_name: 'Read' },
    { hook_event_name: 'PreToolUse', command_name: 'superpowers:brainstorming', tool_name: 'Read' },
    { hook_event_name: 'UserPromptExpansion', command_name: 'other:skill', tool_input: target.tool_input },
  ];
  for (const payload of inputs) {
    const result = invoke(dir, payload);
    normal(result);
    assert.equal(result.stdout, '');
  }
  assert.equal(records(dir).length, inputs.length);
  for (const record of records(dir)) {
    assert.equal(record.decision, 'skipped');
    assert.equal(record.response, null);
  }
});

test('repeated invocations never overwrite or deduplicate a session', t => {
  const dir = fixture(t);
  for (let i = 0; i < 4; i++) {
    const result = invoke(dir, { ...target, session_id: 'same-session', tool_use_id: 'same-tool-use' });
    normal(result);
    assert.ok(JSON.parse(result.stdout).hookSpecificOutput);
  }
  assert.equal(records(dir).length, 4);
  assert.equal(new Set(readdirSync(dir)).size, 4);
});

test('captures structural evidence but never copies or executes sensitive arguments', t => {
  const dir = fixture(t);
  const sentinel = join(dir, 'must-not-exist');
  const secrets = ['private-prompt-991', 'private-transcript-992', 'private-user-993', 'private-token-994', 'private-env-995', 'private-args-996'];
  const payload = {
    ...target, cwd: dir, session_id: 'private-session-997', tool_use_id: 'private-tool-use-998',
    prompt: secrets[0], transcript_path: secrets[1], user: secrets[2], credentials: secrets[3], env: { TOKEN: secrets[4] },
    marker: 'untrusted-stdin-marker', run_id: 'untrusted-run', out_dir: '/untrusted-dir',
    command_args: secrets[5],
    tool_input: { skill: 'superpowers:brainstorming', args: `$(touch '${sentinel}') ${secrets[5]}`, prompt: secrets[0], nested: { token: secrets[3] }, list: [secrets[4]], nothing: null, enabled: true, count: 2 },
  };
  const result = invoke(dir, payload);
  normal(result);
  const [record] = records(dir);
  const serialized = JSON.stringify(record);
  for (const secret of [...secrets, payload.session_id, payload.tool_use_id, sentinel, payload.marker, payload.run_id, payload.out_dir]) assert.ok(!serialized.includes(secret), secret);
  assert.equal(existsSync(sentinel), false);
  assert.equal(record.run_id, 'fixture-run');
  assert.equal(record.input.cwd, dir);
  assert.equal(record.input.session_id_sha256, createHash('sha256').update(payload.session_id).digest('hex'));
  assert.equal(record.input.tool_use_id_sha256, createHash('sha256').update(payload.tool_use_id).digest('hex'));
  assert.deepEqual(record.input.tool_input, {
    field_names: ['skill', 'args', 'prompt', 'nested', 'list', 'nothing', 'enabled', 'count'],
    field_types: { skill: 'string', args: 'string', prompt: 'string', nested: 'object', list: 'array', nothing: 'null', enabled: 'boolean', count: 'number' },
    skill: 'superpowers:brainstorming',
  });
  assert.ok(!JSON.stringify(record.input).includes(marker));
});

for (const payload of ['', '{broken', 'null', '[]', '123', '{"hook_event_name":42}', '{"hook_event_name":"PreToolUse","tool_name":"Skill","tool_input":{"skill":{}}}']) {
  test(`malformed input safely diagnoses (${payload || 'empty'})`, t => {
    const dir = fixture(t);
    const result = invoke(dir, payload);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^H1_[A-Z_]+\n$/);
  });
}

test('unknown event saves only skipped evidence and returns a diagnostic', t => {
  const dir = fixture(t);
  const result = invoke(dir, { ...target, hook_event_name: 'UnknownEvent' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^H1_[A-Z_]+\n$/);
  assert.equal(records(dir)[0].decision, 'skipped');
});

test('one MiB is accepted, larger UTF-8 byte input is rejected', t => {
  const dir = fixture(t);
  const base = JSON.stringify({ ...target, prompt: '' });
  const exact = base.replace('"prompt":""', `"prompt":"${'x'.repeat(2 ** 20 - Buffer.byteLength(base))}"`);
  assert.equal(Buffer.byteLength(exact), 2 ** 20);
  normal(invoke(dir, exact));
  for (const oversized of [exact + ' ', JSON.stringify({ ...target, prompt: '界'.repeat(400000) })]) {
    const result = invoke(dir, oversized);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'H1_INPUT_TOO_LARGE\n');
  }
  assert.equal(records(dir).length, 1);
});

test('invalid arguments stay fail-open with no output or raw argument disclosure', t => {
  const dir = fixture(t);
  for (const args of [[], ['--out-dir', 'relative', '--run-id', 'ok', '--marker', marker], ['--out-dir', dir, '--run-id', '../private-arg', '--marker', marker], ['--out-dir', dir, '--run-id', 'ok', '--marker', marker, '--unknown', 'private-arg'], ['--out-dir', dir, '--run-id', 'ok', '--marker', marker, '--run-id', 'duplicate']]) {
    const result = invoke(dir, target, args);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'H1_ARGUMENT_ERROR\n');
  }
  assert.deepEqual(readdirSync(dir), []);
});

test('filesystem write failure never emits success JSON', t => {
  const dir = fixture(t);
  const file = join(dir, 'not-a-directory');
  writeFileSync(file, 'original');
  for (const out of [file, join(dir, 'missing', 'nested')]) {
    const result = invoke(dir, target, ['--out-dir', out, '--run-id', 'fixture-run', '--marker', marker]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'H1_WRITE_ERROR\n');
  }
  assert.equal(readFileSync(file, 'utf8'), 'original');
});
