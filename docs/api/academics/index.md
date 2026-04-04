# Academics API Split Documentation Index

This index maps each academics router to its dedicated documentation file.

Base API prefix: `/api/v1`

---

## Router to Documentation Mapping

| Router | Source File | Documentation File | Endpoint Signatures |
|---|---|---|---:|
| Courses Router | `app/api/routers/academics/courses.py` | [courses.md](courses.md) | 9 |
| Groups Router | `app/api/routers/academics/groups.py` | [groups.md](groups.md) | 10 |
| Sessions Router | `app/api/routers/academics/sessions.py` | [sessions.md](sessions.md) | 7 |

**Total unique endpoint signatures: 26**

---

## Supporting Files Reviewed

Request/public schema references used to build these docs:
- `app/modules/academics/schemas/course_schemas.py`
- `app/modules/academics/schemas/group_schemas.py`
- `app/modules/academics/schemas/session_schemas.py`
- `app/api/schemas/academics/course.py`
- `app/api/schemas/academics/group.py`
- `app/api/schemas/academics/session.py`
- `app/api/schemas/common.py`
- `app/api/dependencies.py`
- `app/api/exceptions.py`

---

## Verification

Coverage checklist:
- [verification-checklist.md](verification-checklist.md)
