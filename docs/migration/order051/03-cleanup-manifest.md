# GitLab cleanup manifest

The deployed-source branch was already surgically reduced before ORDER-051: 35 tracked files and 10,782 text LOC.

No additional source subsystem was deleted during the audit because no further deletion met every safety condition:
- unreachable from runtime;
- unnecessary to canonical tests/config;
- no unique current behavior;
- history recoverable;
- fresh verification green.

ORDER-051 made one migration-only source change on `migration/order051-gitlab-cleanup-v1`:
- expose non-secret `ATM_GIT_SHA` in `/health`;
- add an exact-SHA/readback contract test.

Commit: `d13b4bd757670a2cff1606ae632add00733b9cd8` with `[skip ci]`.

After GitHub cutover, GitLab CI/deploy authority was retired on the former deployed-source branch by `51cb7652c98b310d8cb0b5f5013351f1aea9b588` with `[skip ci]` and `workflow: when: never`.
