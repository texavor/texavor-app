# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Login" [level=1] [ref=e8]
        - paragraph [ref=e9]: Enter your email below to login to your account
      - generic [ref=e10]:
        - textbox "Enter Email" [ref=e11]
        - generic [ref=e12]:
          - textbox "Password" [ref=e13]
          - button "Show password" [ref=e14] [cursor=pointer]:
            - img
            - generic [ref=e15]: Show password
        - link "Forgot Password?" [ref=e17]:
          - /url: /forgot-password
        - button "Login" [ref=e18] [cursor=pointer]
      - generic [ref=e23]: or sign in via
      - link "Google Google" [ref=e25]:
        - /url: http://localhost:3000/api/v1/auth/google_oauth2
        - button "Google Google" [ref=e26] [cursor=pointer]:
          - img "Google" [ref=e27]
          - text: Google
      - generic [ref=e28]:
        - text: Don't have an account?
        - link "Sign up" [ref=e29]:
          - /url: /register
    - img "Texavor logo" [ref=e33]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e45]
```