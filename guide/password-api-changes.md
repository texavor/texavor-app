# Password API Changes - Frontend Integration Guide

## Breaking Changes

The password management endpoints have been updated to separate password change and password reset operations.

---

## 🔴 BREAKING CHANGE: Password Change Endpoint

### Old Endpoint (Deprecated)

```
PUT /api/v1/password
```

### New Endpoint

```
PUT /api/v1/password/change
```

**Action Required**: Update all frontend calls that change authenticated user passwords.

---

## API Endpoints

### 1. Change Password (Authenticated Users)

**Endpoint**: `PUT /api/v1/password/change`

**Authentication**: Required (JWT token)

**Use Case**: User is logged in and wants to change their password

**Request Body**:

```json
{
  "current_password": "OldPassword123",
  "user": {
    "password": "NewPassword123",
    "password_confirmation": "NewPassword123"
  }
}
```

**Success Response** (200):

```json
{
  "message": "Password updated successfully"
}
```

**Error Response** (422):

```json
{
  "errors": ["Current password is incorrect"]
}
```

---

### 2. Request Password Reset (Forgot Password)

**Endpoint**: `POST /api/v1/password`

**Authentication**: Not required

**Use Case**: User forgot password and needs reset email

**Request Body**:

```json
{
  "user": {
    "email": "user@example.com"
  }
}
```

**Success Response** (200):

```json
{
  "status": {
    "code": 200,
    "message": "If your email address is in our database, you will receive a password reset link."
  }
}
```

**Error Response** (422):

```json
{
  "status": {
    "code": 422,
    "message": "Error sending password reset instructions.",
    "errors": ["Email can't be blank"]
  }
}
```

---

### 3. Reset Password with Token

**Endpoint**: `PUT /api/v1/password` or `PATCH /api/v1/password`

**Authentication**: Not required (uses reset token)

**Use Case**: User received reset email and is setting new password

**Request Body**:

```json
{
  "user": {
    "reset_password_token": "TOKEN_FROM_EMAIL",
    "password": "NewPassword123",
    "password_confirmation": "NewPassword123"
  }
}
```

**Success Response** (200):

```json
{
  "status": {
    "code": 200,
    "message": "Password reset successfully."
  }
}
```

**Error Response** (422):

```json
{
  "status": {
    "code": 422,
    "message": "Error resetting password.",
    "errors": ["Reset password token is invalid"]
  }
}
```

---

## Frontend Implementation Examples

### React/TypeScript Example

```typescript
// 1. Change Password (Authenticated)
const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await axiosInstance.put("/password/change", {
    current_password: currentPassword,
    user: {
      password: newPassword,
      password_confirmation: newPassword,
    },
  });
  return response.data;
};

// 2. Request Password Reset
const requestPasswordReset = async (email: string) => {
  const response = await axiosInstance.post("/password", {
    user: { email },
  });
  return response.data;
};

// 3. Reset Password with Token
const resetPassword = async (token: string, newPassword: string) => {
  const response = await axiosInstance.put("/password", {
    user: {
      reset_password_token: token,
      password: newPassword,
      password_confirmation: newPassword,
    },
  });
  return response.data;
};
```

---

## Migration Checklist

- [ ] Update password change API calls from `/password` to `/password/change`
- [ ] Ensure password change requests include `current_password` field
- [ ] Verify password reset flow still works (should be unchanged)
- [ ] Update any API documentation or constants
- [ ] Test all password-related flows:
  - [ ] Change password while logged in
  - [ ] Request password reset email
  - [ ] Reset password using email link

---

## Notes

- **Password Change** requires authentication and current password
- **Password Reset** does not require authentication but needs reset token from email
- Both operations use different endpoints to avoid conflicts
- Error handling remains consistent with existing API patterns
