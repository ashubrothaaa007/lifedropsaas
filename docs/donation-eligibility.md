# LifeDrop Donation Eligibility

## Enabling an Approved Donation Policy

Before enabling donation eligibility, qualified medical governance must approve the policy.

In Payload Admin, navigate to **Operations → Approved Donation Policy**. The following details must be reviewed and approved before an administrator enables the policy:

- Reference jurisdiction and applicable guidelines
- Supported whole-blood donation programme
- Minimum and maximum donor age
- Minimum donor weight
- Required interval between donations
- Alcohol declaration window
- Screening validity period

The application does not provide default clinical thresholds. An incomplete or disabled policy prevents donors from submitting assessment requests.

The donor demo uses illustrative thresholds for demonstration purposes only. These values must not be treated as approved medical guidance.

The current implementation supports one approved whole-blood donation policy. Do not use the same policy for donation types or donor groups that require different eligibility criteria unless the approved policy explicitly covers them.

Preliminary screening is not a diagnosis or medical clearance. Medication use or relevant medical history may trigger a conservative block and guidance to contact the donation centre. Donors must not stop medication or change their declarations to qualify.

## Eligibility Workflow

1. Donors answer the screening questions, including age, weight, first or previous donation date, illness or fever, medication and relevant medical history, and alcohol consumption. They must also provide consent for their information to be stored.

2. The server calculates preliminary eligibility and the required waiting period. The most recent recorded donation completion or external-donation declaration takes precedence. Declaring a first donation cannot override existing donation history.

3. An assessment request can be submitted only when:

   - The screening result is passed and still valid.
   - The required waiting period has ended.
   - Donor availability is enabled.

   Selecting a future appointment date does not bypass the waiting period that applies today.

4. A database-level unique reservation prevents a donor from having multiple active assessment requests simultaneously. Collection hooks enforce this rule for requests made outside the user interface and recheck eligibility during confirmation, medical approval and completion.

5. Only the assigned, verified hospital account can confirm or medically approve an assessment. Hospital staff record measured haemoglobin, blood pressure, other clinical findings and professional eligibility and compatibility attestations.

   Medical approval cannot be recorded before the scheduled appointment time.

6. Donation completion is a separate operation performed by the hospital after medical approval. The appointment becomes an immutable completed donation record containing:

   - Actual completion time
   - Policy reference
   - Required donation interval
   - Next eligible donation date

   Completion, cancellation or rejection releases the donor reservation within the same Payload request transaction. A new screening is required before the donor can submit another assessment request.

## Screening Data and Access Control

Screening submissions are append-only and private.

- Donors can access their own screening submissions.
- Verified hospital accounts can access screening declarations only for donors with an active appointment assigned to that hospital.
- Receivers cannot access donor screening information.
- CMS administrators and public application accounts remain separate.

Application authentication continues to use Payload JWTs stored in the HTTP-only `app-session` cookie.

Existing records and legacy screening fields are preserved. However, legacy screening records that do not contain the new questionnaire version cannot be used to authorize new assessment requests.

Previously completed appointments continue to count towards donation history and waiting-period calculations.

No historical documents were rewritten or automatically seeded as part of this change.

## Storage and Rendering

Persistent data continues to use the existing managed Payload database connection. The application does not select, configure or replace the underlying database adapter.

The implementation does not assume PostgreSQL-specific storage. The actual database engine must be confirmed through the deployment environment rather than introducing a separate application database.

The following routes remain static page shells:

- `/`
- `/join`
- `/dashboard`

Authenticated dashboard data and mutations are handled through the request-time LifeDrop API using `no-store` responses.

Eligibility information refreshes every minute while the screening flow is open and when the user returns to a visible browser tab. The displayed countdown is informational; the server independently validates eligibility whenever a mutation is submitted.

Changes to the approved donation policy are reflected in subsequent API requests and do not require rebuilding the static page shells.

## Verification

Run the following checks:

```sh
node --experimental-strip-types --test tests/*.test.mjs

pnpm exec tsc --noEmit
```

Also run the deployment environment's configured verification command before release.

Tests cover the eligibility rules and actual collection hooks using a mocked Payload boundary. They also cover simultaneous donor reservation attempts.

These tests do not establish that live database transactions have been tested end to end, nor do they constitute clinical validation.

**Medical governance approval is required before this service is used for real donation coordination.**
