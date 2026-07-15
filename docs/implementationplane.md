# Implementation Plan — Multi-Account Quota-Based Email Broadcast System

**Project:** FYCS Study Hub
**Goal:** Admin panel se broadcast email bhejte waqt, 4 Google Apps Script (Gmail) accounts ka live quota check karke, users ki list ko smartly baant kar reliably bhejna — aur jo users quota khatam hone ki wajah se reh jaayein unhe UI mein dikhana.

**Speed upgrade (v2):** Ab har account apni list ek-ek recipient karke loop mein nahi bhejega — balki BCC ka use karke ek hi `sendEmail()` call mein 40 logon tak bhej dega. Isse execution time bahut kam ho jata hai kyunki Apps Script mein har `MailApp.sendEmail()` call ka apna overhead hota hai (connection setup, function call cost) — 50 alag calls karne ki jagah agar 1-2 calls mein hi 50 logo ko BCC kar diya jaye, to wahi kaam 10-20x tez ho jata hai.

### BCC batching kaise kaam karta hai (samjho)

- **BCC (Blind Carbon Copy)** ka matlab hai — ek hi email multiple logon ko bheji jaa sakti hai, aur koi bhi recipient dusre recipients ke email address nahi dekh sakta (privacy safe hai, jaisa CC mein hota hai wo BCC mein nahi hota).
- Gmail/Apps Script ek single email mein reliably ~40-50 BCC recipients tak allow karta hai.
- To agar ek account ko 51 users bhejne hain, to wo pehle 40 ko ek BCC email mein bhejega, phir bache hue 11 ko doosre BCC email mein — matlab loop 51 baar chalne ki jagah sirf 2 baar chalega.
- **Quota pe fark nahi padta** — Gmail daily quota abhi bhi *har recipient ko* count karta hai (BCC ho ya alag-alag email), to 51 logo ko bhejne se quota 51 hi consume hoga jaisa pehle hota tha. Sirf **speed** better hoti hai, quota limit same rehta hai.
- **Personalization ka trade-off:** Sabko same content wala email jaayega (jo already tera case hai — broadcast notification same sabko), agar future mein kabhi naam se personalize karna ho ("Hi Rahul") to BCC se nahi ho payega, tab per-recipient loop hi chahiye hoga.

---

## Problem Summary (kya thi aur kyu thi)

- Pehle system 10 emails ek saath ek hi Gmail account (Apps Script URL) ko hit karta tha.
- Us account ke overload/fail hone par bhi system `no-cors` fallback ki wajah se galti se "sent" maan leta tha — asal mein email jaati nahi thi.
- Isliye 150 users mein se sirf 1-2 ko hi email milti thi, baaki fail hoti thi bina system ko pata chale.

## Final Solution (kya banayenge)

1. Bhejne se pehle chaaron Gmail accounts ka **live remaining quota** check karo.
2. Quota ke hisaab se recipients ko **greedy-fill** karke 4 alag lists mein baanto (jis account mein jitna quota bacha hai, utne hi users usko milenge).
3. Har account ko uski poori list **ek hi request mein** bhejo (chaaron parallel) — account apni list ke andar khud sequentially emails bhejega.
4. Jo users kisi bhi account ke quota mein fit nahi hue, unko "unsent" list mein UI par dikhao taaki baad mein resend kiya ja sake.

---

## PART 1 — Google Apps Script (`.gs` files)

**Kahan:** Chaaron Gmail accounts ke Apps Script projects (jo 4 alag `VITE_MAIL_SCRIPT_URL` mein use ho rahe hain). Ye change **chaaron** mein karna hai (same code, copy-paste).

**Kya karna hai:** Existing `doPost(e)` function ko poora replace karo is naye version se. Ye function ab 2 actions samajhega: `checkQuota` (kitna quota bacha hai batana) aur `sendBatch` (ek poori list ko andar hi andar ek-ek karke bhejna).

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Action 1: sirf quota poochha ja raha hai
    if (data.action === "checkQuota") {
      const remaining = MailApp.getRemainingDailyQuota();
      return ContentService.createTextOutput(JSON.stringify({status:"ok", remaining}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Action 2: poori list bhejni hai (ab BCC chunks mein — fast)
    if (data.action === "sendBatch") {
      const sent = [];
      const failed = [];
      const CHUNK_SIZE = 40; // ek BCC email mein max 40 log

      const allEmails = data.recipients.map(r => r.email);

      for (let i = 0; i < allEmails.length; i += CHUNK_SIZE) {
        const chunk = allEmails.slice(i, i + CHUNK_SIZE);
        try {
          if (MailApp.getRemainingDailyQuota() < chunk.length) {
            // is chunk ke liye poora quota nahi bacha, sabko fail maano
            chunk.forEach(e => failed.push(e));
            continue;
          }
          MailApp.sendEmail({
            to: Session.getActiveUser().getEmail(), // "to" khud ko, real recipients BCC mein
            bcc: chunk.join(","),
            subject: data.subject,
            htmlBody: data.messageHtml
          });
          chunk.forEach(e => sent.push(e));
        } catch (innerErr) {
          chunk.forEach(e => failed.push(e));
        }
      }

      return ContentService.createTextOutput(JSON.stringify({status:"ok", sent, failed}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({status:"error", message:"unknown action"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:"error", message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Deploy check:** Har script change karne ke baad **naya deployment version** publish karna mat bhoolna (Deploy → Manage Deployments → Edit → New Version), warna purana code hi live rahega.

---

## PART 2 — `src/pages/Admin.jsx`

**Kahan:** `handleSendNotification` function ke andar, `const mailScriptUrl = import.meta.env.VITE_MAIL_SCRIPT_URL;` ke baad se lekar `sendEmail` function aur batching loop tak — ye poora purana block replace hoga.

### Step 2.1 — Quota fetch karne wala helper add karo

`const urls = mailScriptUrl.split(",").map(u => u.trim()).filter(Boolean);` line ke turant baad ye add karo:

```javascript
// Chaaron account ka live quota check karo
const fetchAllQuotas = async () => {
  return Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "checkQuota" })
      });
      const data = await res.json();
      return { url, remaining: data.remaining ?? 0 };
    } catch {
      return { url, remaining: 0 };
    }
  }));
};

const quotas = await fetchAllQuotas();
```

### Step 2.2 — Recipients ko quota ke hisaab se baanto

`recipients` array banane wala existing code (jo `notificationEmail`/`ALL` se recipients banata hai) waisa hi rakho. Uske turant baad ye naya allocation logic add karo:

```javascript
const batchesByUrl = {};
urls.forEach(u => batchesByUrl[u] = []);

const unsentUsers = [];
let recipientIndex = 0;

for (const q of quotas) {
  let taken = 0;
  while (taken < q.remaining && recipientIndex < recipients.length) {
    batchesByUrl[q.url].push({ email: recipients[recipientIndex] });
    recipientIndex++;
    taken++;
  }
}
while (recipientIndex < recipients.length) {
  unsentUsers.push(recipients[recipientIndex]);
  recipientIndex++;
}
```

### Step 2.3 — Purane `sendEmail` + `BATCH_SIZE` loop ko replace karo

Purana `sendEmail` function, `BATCH_SIZE = 10` wala loop, aur uske andar ka poora Promise.all batching — sab **hata do**. Uski jagah ye naya code daalo (email HTML template `globalNoticeTemplate` wahi purana rakho, bas ab loop se bahar ek hi jagah define hoga):

```javascript
const globalNoticeTemplate = `
  <!-- yahan wahi purana email HTML template rahega jo pehle sendEmail ke andar tha -->
`;

const loadingToast = toast.loading(`Sending to ${recipients.length} users across ${urls.length} accounts...`);

const batchPromises = urls.map(async (url) => {
  const list = batchesByUrl[url];
  if (list.length === 0) return { sent: [], failed: [] };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "sendBatch",
        recipients: list,
        subject: `BNN CS Hub Update: ${notificationTitle.trim()}`,
        messageHtml: globalNoticeTemplate
      })
    });
    const data = await res.json();
    return { sent: data.sent || [], failed: data.failed || [] };
  } catch {
    return { sent: [], failed: list.map(i => i.email) };
  }
});

const allResults = await Promise.all(batchPromises);
toast.dismiss(loadingToast);

const successCount = allResults.reduce((sum, r) => sum + r.sent.length, 0);
const failedEmails = allResults.flatMap(r => r.failed);
const failCount = failedEmails.length;
const totalEmails = recipients.length;
```

**Important:** `notificationTitle`/`emailContent` jo pehle template ke andar interpolate ho rahe the, wo ab bhi `globalNoticeTemplate` ke andar same tarah use honge — sirf position badla hai (ab function ke bahar ek hi baar banta hai, har email ke liye alag-alag nahi).

### Step 2.4 — Summary modal (`Swal.fire`) mein "unsent" section add karo

Jo existing `Swal.fire({ title: "Broadcast Summary..." })` hai, uske `html` string ke andar, `failedEmails.length > 0 ? ... : ''` wale block ke turant baad, ye naya block add karo:

```javascript
${unsentUsers.length > 0 ? `
  <div class="mt-3">
    <p class="font-bold text-amber-300 mb-1">Quota khatam — inko email nahi bheji ja saki:</p>
    <div class="max-h-24 overflow-y-auto bg-zinc-900/50 p-2 rounded-lg font-mono text-[10px] break-all border border-zinc-800">
      ${unsentUsers.join("<br/>")}
    </div>
    <p class="text-[10px] text-zinc-500 mt-1">Kal quota reset hone ke baad inhe dobara bhej sakte ho.</p>
  </div>
` : ''}
```

**Resend flow:** `unsentUsers` list ko copy karke `notificationEmail` input field mein comma-separated paste karne se wahi existing manual-target logic (`targetEmails = rawTarget.split(",")`) use ho jayega — koi extra code nahi chahiye.

---

## PART 3 — `src/components/admin/AdminSettings.jsx`

**Kahan:** Naya section add karna hai jo admin ko chaaron accounts ka live quota dikhaye (settings panel khulte hi ya "Refresh" button dabane par).

### Step 3.1 — Quota fetch function

Component ke top-level function declarations ke saath ye add karo:

```javascript
const [accountQuotas, setAccountQuotas] = useState([]);
const [loadingQuotas, setLoadingQuotas] = useState(false);

const fetchAllQuotas = async () => {
  setLoadingQuotas(true);
  const urls = import.meta.env.VITE_MAIL_SCRIPT_URL.split(",").map(u => u.trim()).filter(Boolean);
  const results = await Promise.all(urls.map(async (url, idx) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "checkQuota" })
      });
      const data = await res.json();
      return { accountNo: idx + 1, remaining: data.remaining ?? 0 };
    } catch {
      return { accountNo: idx + 1, remaining: 0 };
    }
  }));
  setAccountQuotas(results);
  setLoadingQuotas(false);
};
```

### Step 3.2 — UI card add karo

Settings panel ke JSX return ke andar, kisi bhi existing settings card ke paas, ye naya card add karo:

```jsx
<div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-white">Email Quota Status</h3>
    <button
      onClick={fetchAllQuotas}
      className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-white"
    >
      {loadingQuotas ? "Checking..." : "Refresh"}
    </button>
  </div>
  <div className="grid grid-cols-2 gap-2">
    {accountQuotas.map((q) => (
      <div key={q.accountNo} className="bg-zinc-800/50 rounded-lg p-2 text-center">
        <p className="text-[10px] text-zinc-400">Account {q.accountNo}</p>
        <p className="text-lg font-bold text-emerald-400">{q.remaining}</p>
        <p className="text-[9px] text-zinc-500">emails left today</p>
      </div>
    ))}
  </div>
</div>
```

### Step 3.3 — Component mount hote hi ek baar call karo

Existing `useEffect` hooks ke saath (ya naya add karo):

```javascript
useEffect(() => {
  fetchAllQuotas();
}, []);
```

---

## Testing Checklist

1. Chaaron `.gs` scripts mein naya `doPost` daal ke **redeploy** karo (New Version).
2. `.env` mein `VITE_MAIL_SCRIPT_URL` mein chaaron URLs comma-separated already hain — confirm kar lo.
3. AdminSettings panel khol ke check karo ki chaaron accounts ka quota number sahi dikh raha hai.
4. Ek chhoti test list (apne 7 test Gmail) pe broadcast bhej ke dekho — sabko email milni chahiye.
5. Ek account ka quota jaan-bujh kar 0 karke (ya kam users bhejke) test karo ki "unsent" list sahi dikh rahi hai.

---

## Files Touched Summary

| File | Kya change hua |
|---|---|
| 4x Apps Script `.gs` (per Gmail account) | `doPost` mein `checkQuota` + `sendBatch` actions add kiye |
| `src/pages/Admin.jsx` | `handleSendNotification` — quota fetch, greedy allocation, batch send, unsent list in summary |
| `src/components/admin/AdminSettings.jsx` | Naya "Email Quota Status" card — live quota dikhane ke liye |
