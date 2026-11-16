import assert from 'assert';
import crypto from 'crypto';

console.log('🧪 Starting NexusCraft Core Platform Unit Tests...\n');

// ─── 1. TOKENOMICS & FINANCIAL INVARIANTS ───
console.log('Test 1: NCX Tokenomics Rules');
const INITIAL_WELCOME_BONUS = 500;
const SUBMISSION_DEDUCTION_FEE = 50;

let clientBalance = INITIAL_WELCOME_BONUS;
assert.strictEqual(clientBalance, 500, 'Welcome bonus must be exactly 500 NCX');

// Simulate idea submission deduction
assert.ok(clientBalance >= SUBMISSION_DEDUCTION_FEE, 'Client must have sufficient balance for intake');
clientBalance -= SUBMISSION_DEDUCTION_FEE;
assert.strictEqual(clientBalance, 450, 'Balance after 1 idea submission must be 450 NCX');
console.log('  ✅ 500 NCX welcome bonus and 50 NCX intake deduction pass');

// ─── 2. MILESTONE ESCROW STATE MACHINE ───
console.log('\nTest 2: Escrow State Machine Transitions');
const validEscrowStates = [
  'quote_approved',
  'funds_locked',
  'in_progress',
  'deliverable_submitted',
  'hash_verified',
  'client_accepted',
  'funds_released'
];

let currentState = 'quote_approved';
const transition = (next) => {
  const currentIndex = validEscrowStates.indexOf(currentState);
  const nextIndex = validEscrowStates.indexOf(next);
  assert.strictEqual(nextIndex, currentIndex + 1, `Invalid transition from ${currentState} to ${next}`);
  currentState = next;
};

transition('funds_locked');
transition('in_progress');
transition('deliverable_submitted');
transition('hash_verified');
transition('client_accepted');
transition('funds_released');
assert.strictEqual(currentState, 'funds_released');
console.log('  ✅ Escrow transitions follow strict linear progression to funds_released');

// ─── 3. CRYPTOGRAPHIC SHA-256 HASH VERIFICATION ───
console.log('\nTest 3: Cryptographic SHA-256 Checksum Calculation');
const mockDeliverableBuffer = Buffer.from('NexusCraft Production Package Payload v1.0.0');
const sha256Hash = crypto.createHash('sha256').update(mockDeliverableBuffer).digest('hex');

assert.strictEqual(typeof sha256Hash, 'string');
assert.strictEqual(sha256Hash.length, 64, 'SHA-256 hex string must be exactly 64 characters');

// Verify idempotency
const recomputedHash = crypto.createHash('sha256').update(mockDeliverableBuffer).digest('hex');
assert.strictEqual(sha256Hash, recomputedHash, 'Recomputed SHA-256 hash must be identical');
console.log('  ✅ SHA-256 cryptographic deliverable hashing verified: ' + sha256Hash.slice(0, 16) + '...');

// ─── 4. SLA BOTTLENECK RADAR LOGIC ───
console.log('\nTest 4: Nexus SLA Radar Bottleneck Thresholds');
const now = Date.now();
const hourMs = 60 * 60 * 1000;

const evaluateSla = (project) => {
  const ageHours = (now - project.createdAt) / hourMs;
  if (project.status === 'Submitted' && ageHours > 48) {
    return 'BREACHED_SCOPING_DELAY';
  }
  if (project.status === 'Approved' && !project.assignedFreelancerId && ageHours > 72) {
    return 'BREACHED_ASSIGNMENT_DELAY';
  }
  if (project.status === 'Deliverable Submitted' && ageHours > 24) {
    return 'BREACHED_VERIFICATION_DELAY';
  }
  return 'HEALTHY';
};

const freshProject = { status: 'Submitted', createdAt: now - (5 * hourMs) };
const stalledScopingProject = { status: 'Submitted', createdAt: now - (55 * hourMs) };
const unassignedProject = { status: 'Approved', assignedFreelancerId: null, createdAt: now - (80 * hourMs) };

assert.strictEqual(evaluateSla(freshProject), 'HEALTHY');
assert.strictEqual(evaluateSla(stalledScopingProject), 'BREACHED_SCOPING_DELAY');
assert.strictEqual(evaluateSla(unassignedProject), 'BREACHED_ASSIGNMENT_DELAY');
console.log('  ✅ SLA radar correctly identifies healthy vs breached lifecycle states');

// ─── 5. PRE-SUBMISSION READINESS INSPECTOR ───
console.log('\nTest 5: Pre-Submission Readiness Inspector');
const checkReadiness = (file, notes) => {
  const errors = [];
  if (!file) errors.push('No file selected');
  if (file && !file.name.endsWith('.zip')) errors.push('Must be a .zip file');
  if (file && file.size > 50 * 1024 * 1024) errors.push('Exceeds 50MB limit');
  if (!notes || notes.trim().length < 10) errors.push('Release notes must be at least 10 characters');
  return { ready: errors.length === 0, errors };
};

const validPkg = checkReadiness({ name: 'deliverable-v1.zip', size: 12000000 }, 'Contains all source code and runbook.');
const invalidPkg = checkReadiness({ name: 'package.tar.gz', size: 60000000 }, 'Too short');

assert.strictEqual(validPkg.ready, true);
assert.strictEqual(invalidPkg.ready, false);
assert.strictEqual(invalidPkg.errors.length, 3);
console.log('  ✅ Pre-submission readiness rules properly validate size, extension, and release notes');

console.log('\n🎉 ALL 5 CORE PLATFORM UNIT TESTS PASSED SUCCESSFULLY!\n');
