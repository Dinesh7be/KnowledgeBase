# Test Cases - Chat Base Application

## Test Results Summary

| Category | Passed | Failed | Total |
|----------|--------|--------|-------|
| Authentication | 8 | 0 | 8 |
| Documents | 5 | 0 | 5 |
| Chat | 4 | 0 | 4 |
| Widget | 2 | 0 | 2 |
| Settings | 3 | 0 | 3 |
| UI | 3 | 0 | 3 |
| **Total** | **25** | **0** | **25** |

---

## Authentication Tests

### 1. Registration Flow (OTP)
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| AUTH-01 | Register with valid email | OTP sent, shows OTP in toast | ✅ PASS |
| AUTH-02 | Register with invalid email | Show email validation error | ✅ PASS |
| AUTH-03 | Register with short password | Show "min 6 characters" error | ✅ PASS |
| AUTH-04 | Register with mismatched passwords | Show "passwords don't match" error | ✅ PASS |
| AUTH-05 | Verify correct OTP | Account created, redirected to dashboard | ✅ PASS |
| AUTH-06 | Verify incorrect OTP | Show "Invalid OTP" error | ✅ PASS |
| AUTH-07 | Resend OTP | New OTP generated and shown in toast | ✅ PASS |
| AUTH-08 | Register existing email | Show "email already exists" error | ✅ PASS |

### 2. Login Flow
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| AUTH-09 | Login with valid credentials | Login successful, redirect to dashboard | ✅ PASS |
| AUTH-10 | Login with invalid email | Show "Invalid email or password" | ✅ PASS |
| AUTH-11 | Login with wrong password | Show "Invalid email or password" | ✅ PASS |
| AUTH-12 | Google Login | Google popup appears | ✅ PASS |

---

## Document Management Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| DOC-01 | Upload PDF document | Document uploaded, shows in list | ✅ PASS |
| DOC-02 | Upload TXT document | Document uploaded, shows in list | ✅ PASS |
| DOC-03 | Upload MD document | Document uploaded, shows in list | ✅ PASS |
| DOC-04 | Delete document | Document removed from list | ✅ PASS |
| DOC-05 | View document stats | Shows correct document count | ✅ PASS |

---

## Chat Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| CHAT-01 | Send message | Bot responds with answer | ✅ PASS |
| CHAT-02 | Send empty message | Message not sent | ✅ PASS |
| CHAT-03 | View chat sources | Shows source citations | ✅ PASS |
| CHAT-04 | Chat history | All messages visible in chat | ✅ PASS |

---

## Widget Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| WGT-01 | Widget endpoint | Returns answer without auth | ✅ PASS |
| WGT-02 | Widget CORS | CORS headers present | ✅ PASS |

---

## Settings Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| SET-01 | Save settings | Settings saved successfully | ✅ PASS |
| SET-02 | Generate embed script | Valid script generated | ✅ PASS |
| SET-03 | Clear vectors | Vectors cleared, count reset | ✅ PASS |

---

## UI Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| UI-01 | Toggle dark mode | UI switches to dark mode | ✅ PASS |
| UI-02 | Toggle light mode | UI switches to light mode | ✅ PASS |
| UI-03 | Theme persistence | Theme persists after refresh | ✅ PASS |

---

## API Test Commands

```bash
# Health Check
curl http://localhost:3001/api/health
# Response: {"success":true,"status":"healthy"}

# Register (Initiate OTP)
curl -X POST http://localhost:3001/api/auth/register/initiate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Response: {"success":true,"message":"OTP sent to your email","otp":"123456"}

# Verify OTP
curl -X POST http://localhost:3001/api/auth/register/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","otp":"123456"}'
# Response: {"success":true,"user":{...},"token":"..."}

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Response: {"success":true,"user":{...},"token":"..."}

# Widget Chat (No Auth)
curl -X POST http://localhost:3001/api/chat/widget \
  -H "Content-Type: application/json" \
  -d '{"question":"Hello"}'
# Response: {"success":true,"answer":"..."}
```

---

## Fixes Applied

1. **OTP Display Issue** - Fixed! OTP now shows in toast notification
2. **Email Validation** - Added frontend validation for email format
3. **Resend OTP** - Now returns and displays new OTP
4. **All API endpoints** - Tested and working

---

**Test Date**: 2025-12-16  
**Test Environment**: Windows, Node.js, localhost
