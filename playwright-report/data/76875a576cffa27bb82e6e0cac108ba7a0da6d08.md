# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: e2e/auth.setup.ts:5:6

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
  navigated to "https://accounts.google.com/v3/signin/identifier?opparams=%253F&dsh=S2080680332%3A1783222623233844&client_id=1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com&code_challenge=uIqtzRN-XbdDKgrzJ5m3BXq5cKdwnnxl9z8q5f5tCDo&code_challenge_method=S256&o2v=2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle&response_type=code&scope=openid+email+profile&service=lso&state=d6ZBRKtgkhxXYCDvLxyT7bjRCBwL5NH_5orjkyide-M&flowName=GeneralOAuthLite&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Flegacy%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAPF0KPh2SO4oXtSkvmQM0kceY7qu_1Zgp8ktxF6EE3VdrFA5MPo1DqhYslIGXFI51XVxsLcMhJECX_9xMC1O0Lx7ZLjDD5UEjByb9N92dN0C0ul3gye24Jee4kGx5NXOiQMxz9akYp5z72h8U4PqIe0ZBLQNjsaGEXXSM2wmoyjeHzzGFrck5XCLslY8AJ7DcIt2rJOWVEgzU5j8p2J-q-hFg_Gev2d0PqOPv5Le-XJ5s2_WFN706OheK4CXw5M_GDmAo16kCqqCuh_C8d1JTHRw5_o8nDWjdtxCigBOc9NdPaakerbJFosD_vJVC80JdAQdIPpGyA8-G4s6jfhCQrvaFQaZ4p_zEYzp0hc9ignAe7xMdyi_9TRyzZYvtpnhwrBdKwklizVvrE-JP_HIMyee32OEHhgZNeEhXOZXURKG5bb-x_nsCngGyf-BqD5s77XEuRpnmEQvcVFZGtSeqMEpMSbZw%26flowName%3DGeneralOAuthFlow%26as%3DS2080680332%253A1783222623233844%26client_id%3D1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com%23&app_domain=http%3A%2F%2Flocalhost%3A3000&rart=ANgoxceowa_fiQCyJT2HQy0y-kLMBKK1uAQpjgi6juIYW34upkCRhaYrTHM8GtpORAyiMqMHSzuOlM4CzkQ0uX1XUEM4idgSHqRxfNxy4whuyHZ4AnnzjXQ"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e7]:
    - generic [ref=e10]:
      - img "Google" [ref=e12]
      - generic [ref=e13]: Sign in with Google
    - generic [ref=e14]:
      - generic [ref=e16]:
        - heading "Sign in" [level=1] [ref=e17]
        - paragraph [ref=e18]:
          - text: to continue to
          - button "cmynd" [ref=e19] [cursor=pointer]
      - generic [ref=e22]:
        - generic [ref=e25]:
          - generic [ref=e30]:
            - textbox "Email or phone" [active] [ref=e31]
            - generic:
              - generic: Email or phone
          - paragraph [ref=e32]:
            - link "Forgot email?" [ref=e33] [cursor=pointer]:
              - /url: /signin/v2/usernamerecovery?app_domain=http://localhost:3000&client_id=1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com&code_challenge=uIqtzRN-XbdDKgrzJ5m3BXq5cKdwnnxl9z8q5f5tCDo&code_challenge_method=S256&continue=https://accounts.google.com/signin/oauth/legacy/consent?authuser%3Dunknown%26part%3DAJi8hAPF0KPh2SO4oXtSkvmQM0kceY7qu_1Zgp8ktxF6EE3VdrFA5MPo1DqhYslIGXFI51XVxsLcMhJECX_9xMC1O0Lx7ZLjDD5UEjByb9N92dN0C0ul3gye24Jee4kGx5NXOiQMxz9akYp5z72h8U4PqIe0ZBLQNjsaGEXXSM2wmoyjeHzzGFrck5XCLslY8AJ7DcIt2rJOWVEgzU5j8p2J-q-hFg_Gev2d0PqOPv5Le-XJ5s2_WFN706OheK4CXw5M_GDmAo16kCqqCuh_C8d1JTHRw5_o8nDWjdtxCigBOc9NdPaakerbJFosD_vJVC80JdAQdIPpGyA8-G4s6jfhCQrvaFQaZ4p_zEYzp0hc9ignAe7xMdyi_9TRyzZYvtpnhwrBdKwklizVvrE-JP_HIMyee32OEHhgZNeEhXOZXURKG5bb-x_nsCngGyf-BqD5s77XEuRpnmEQvcVFZGtSeqMEpMSbZw%26flowName%3DGeneralOAuthFlow%26as%3DS2080680332%253A1783222623233844%26client_id%3D1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com%23&dsh=S2080680332:1783222623233844&flowName=GeneralOAuthLite&o2v=2&opparams=%253F&rart=ANgoxceowa_fiQCyJT2HQy0y-kLMBKK1uAQpjgi6juIYW34upkCRhaYrTHM8GtpORAyiMqMHSzuOlM4CzkQ0uX1XUEM4idgSHqRxfNxy4whuyHZ4AnnzjXQ&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=openid+email+profile&service=lso&state=d6ZBRKtgkhxXYCDvLxyT7bjRCBwL5NH_5orjkyide-M
        - generic [ref=e35]:
          - button "Next" [ref=e37]
          - link "Create account" [ref=e39] [cursor=pointer]:
            - /url: /lifecycle/flows/signup?app_domain=http://localhost:3000&client_id=1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com&code_challenge=uIqtzRN-XbdDKgrzJ5m3BXq5cKdwnnxl9z8q5f5tCDo&code_challenge_method=S256&continue=https://accounts.google.com/signin/oauth/legacy/consent?authuser%3Dunknown%26part%3DAJi8hAPF0KPh2SO4oXtSkvmQM0kceY7qu_1Zgp8ktxF6EE3VdrFA5MPo1DqhYslIGXFI51XVxsLcMhJECX_9xMC1O0Lx7ZLjDD5UEjByb9N92dN0C0ul3gye24Jee4kGx5NXOiQMxz9akYp5z72h8U4PqIe0ZBLQNjsaGEXXSM2wmoyjeHzzGFrck5XCLslY8AJ7DcIt2rJOWVEgzU5j8p2J-q-hFg_Gev2d0PqOPv5Le-XJ5s2_WFN706OheK4CXw5M_GDmAo16kCqqCuh_C8d1JTHRw5_o8nDWjdtxCigBOc9NdPaakerbJFosD_vJVC80JdAQdIPpGyA8-G4s6jfhCQrvaFQaZ4p_zEYzp0hc9ignAe7xMdyi_9TRyzZYvtpnhwrBdKwklizVvrE-JP_HIMyee32OEHhgZNeEhXOZXURKG5bb-x_nsCngGyf-BqD5s77XEuRpnmEQvcVFZGtSeqMEpMSbZw%26flowName%3DGeneralOAuthFlow%26as%3DS2080680332%253A1783222623233844%26client_id%3D1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com%23&dsh=S2080680332:1783222623233844&flowEntry=SignUp&flowName=GlifWebSignIn&o2v=2&opparams=%253F&rart=ANgoxceowa_fiQCyJT2HQy0y-kLMBKK1uAQpjgi6juIYW34upkCRhaYrTHM8GtpORAyiMqMHSzuOlM4CzkQ0uX1XUEM4idgSHqRxfNxy4whuyHZ4AnnzjXQ&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=openid+email+profile&service=lso&signInUrl=https://accounts.google.com/signin/oauth?app_domain%3Dhttp://localhost:3000%26client_id%3D1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com%26code_challenge%3DuIqtzRN-XbdDKgrzJ5m3BXq5cKdwnnxl9z8q5f5tCDo%26code_challenge_method%3DS256%26continue%3Dhttps://accounts.google.com/signin/oauth/legacy/consent?authuser%253Dunknown%2526part%253DAJi8hAPF0KPh2SO4oXtSkvmQM0kceY7qu_1Zgp8ktxF6EE3VdrFA5MPo1DqhYslIGXFI51XVxsLcMhJECX_9xMC1O0Lx7ZLjDD5UEjByb9N92dN0C0ul3gye24Jee4kGx5NXOiQMxz9akYp5z72h8U4PqIe0ZBLQNjsaGEXXSM2wmoyjeHzzGFrck5XCLslY8AJ7DcIt2rJOWVEgzU5j8p2J-q-hFg_Gev2d0PqOPv5Le-XJ5s2_WFN706OheK4CXw5M_GDmAo16kCqqCuh_C8d1JTHRw5_o8nDWjdtxCigBOc9NdPaakerbJFosD_vJVC80JdAQdIPpGyA8-G4s6jfhCQrvaFQaZ4p_zEYzp0hc9ignAe7xMdyi_9TRyzZYvtpnhwrBdKwklizVvrE-JP_HIMyee32OEHhgZNeEhXOZXURKG5bb-x_nsCngGyf-BqD5s77XEuRpnmEQvcVFZGtSeqMEpMSbZw%2526flowName%253DGeneralOAuthFlow%2526as%253DS2080680332%25253A1783222623233844%2526client_id%253D1058656736841-146gktlkr3vvb4e7cq230u32dvk8kaon.apps.googleusercontent.com%2523%26dsh%3DS2080680332:1783222623233844%26flowName%3DGeneralOAuthLite%26o2v%3D2%26opparams%3D%25253F%26rart%3DANgoxceowa_fiQCyJT2HQy0y-kLMBKK1uAQpjgi6juIYW34upkCRhaYrTHM8GtpORAyiMqMHSzuOlM4CzkQ0uX1XUEM4idgSHqRxfNxy4whuyHZ4AnnzjXQ%26redirect_uri%3Dhttp://localhost:3000/api/auth/callback/google%26response_type%3Dcode%26scope%3Dopenid%2Bemail%2Bprofile%26service%3Dlso%26state%3Dd6ZBRKtgkhxXYCDvLxyT7bjRCBwL5NH_5orjkyide-M&state=d6ZBRKtgkhxXYCDvLxyT7bjRCBwL5NH_5orjkyide-M
  - contentinfo [ref=e40]:
    - combobox [ref=e43] [cursor=pointer]:
      - option "Afrikaans"
      - option "azərbaycan"
      - option "bosanski"
      - option "català"
      - option "Čeština"
      - option "Cymraeg"
      - option "Dansk"
      - option "Deutsch"
      - option "eesti"
      - option "English (United Kingdom)"
      - option "English (United States)" [selected]
      - option "Español (España)"
      - option "Español (Latinoamérica)"
      - option "euskara"
      - option "Filipino"
      - option "Français (Canada)"
      - option "Français (France)"
      - option "Gaeilge"
      - option "galego"
      - option "Hrvatski"
      - option "Indonesia"
      - option "isiZulu"
      - option "íslenska"
      - option "Italiano"
      - option "Kiswahili"
      - option "latviešu"
      - option "lietuvių"
      - option "magyar"
      - option "Melayu"
      - option "Nederlands"
      - option "norsk"
      - option "o‘zbek"
      - option "polski"
      - option "Português (Brasil)"
      - option "Português (Portugal)"
      - option "română"
      - option "shqip"
      - option "Slovenčina"
      - option "slovenščina"
      - option "srpski (latinica)"
      - option "Suomi"
      - option "Svenska"
      - option "Tiếng Việt"
      - option "Türkçe"
      - option "Ελληνικά"
      - option "беларуская"
      - option "български"
      - option "кыргызча"
      - option "қазақ тілі"
      - option "македонски"
      - option "монгол"
      - option "Русский"
      - option "српски (ћирилица)"
      - option "Українська"
      - option "ქართული"
      - option "հայերեն"
      - option "‫עברית‬‎"
      - option "‫اردو‬‎"
      - option "‫العربية‬‎"
      - option "‫فارسی‬‎"
      - option "አማርኛ"
      - option "नेपाली"
      - option "मराठी"
      - option "हिन्दी"
      - option "অসমীয়া"
      - option "বাংলা"
      - option "ਪੰਜਾਬੀ"
      - option "ગુજરાતી"
      - option "ଓଡ଼ିଆ"
      - option "தமிழ்"
      - option "తెలుగు"
      - option "ಕನ್ನಡ"
      - option "മലയാളം"
      - option "සිංහල"
      - option "ไทย"
      - option "ລາວ"
      - option "မြန်မာ"
      - option "ខ្មែរ"
      - option "한국어"
      - option "中文（香港）"
      - option "日本語"
      - option "简体中文"
      - option "繁體中文"
    - list [ref=e44]:
      - listitem [ref=e45]:
        - link "Open Google Account Help Center (external, opens in a new window)" [ref=e46] [cursor=pointer]:
          - /url: https://support.google.com/accounts?hl=en-US&p=account_iph
          - text: Help
      - listitem [ref=e47]:
        - link "Privacy Policy (external, opens in a new window)" [ref=e48] [cursor=pointer]:
          - /url: https://accounts.google.com/TOS?loc=CO&hl=en-US&privacy=true
          - text: Privacy
      - listitem [ref=e49]:
        - link "Google Terms of Service (external, opens in a new window)" [ref=e50] [cursor=pointer]:
          - /url: https://accounts.google.com/TOS?loc=CO&hl=en-US
          - text: Terms
```

# Test source

```ts
  1  | import { test as setup } from "@playwright/test"
  2  | 
  3  | const authFile = "e2e/.auth/user.json"
  4  | 
  5  | setup("authenticate", async ({ page }) => {
  6  |   await page.goto("/login")
  7  |   await page.waitForSelector('text="Welcome to Troje"')
  8  | 
  9  |   await page.getByText("Continue with Google").click()
> 10 |   await page.waitForURL("/")
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  11 | 
  12 |   await page.context().storageState({ path: authFile })
  13 | })
  14 | 
```