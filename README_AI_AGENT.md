## ⚙️ How to Set Up the AI Agent Workflow (n8n)

Follow the steps below to successfully configure and run the **RasoiMitra Universal Application AI Agent**.

---

## 1️⃣ Configure OpenAI Credentials

1. Open your **n8n dashboard**
2. Go to **Credentials**
3. Add a new **OpenAI API** credential
4. Enter your **OpenAI API Key**
5. Save the credential
6. Select this credential inside the **OpenAI Chat Model** node

> ℹ️ The OpenAI Chat Model node will automatically prompt you to add credentials if none are configured.

---

## 2️⃣ Activate the Workflow

1. Open the imported workflow
2. Toggle the workflow status to **Active**
3. Once active, the workflow will start accepting webhook requests

---

## 3️⃣ Get Your Webhook URL

1. Open the **Frontend Webhook** node
2. Copy the **Production URL**

### Webhook URL Format

```
https://apurvadabhade.app.n8n.cloud/webhook/license-agent
```

👉 Use this URL in your frontend API calls.

---

## 4️⃣ Optional: Switch from OpenAI to Google Gemini

If you prefer **Google Gemini** instead of OpenAI:

### Steps:

1. Delete or disconnect the **OpenAI Chat Model** node
2. Add a **Google Gemini Chat Model** node
3. Connect it to the **AI Application Agent** node
4. Update the model configuration:

   * `modelName`: e.g. `gemini-1.5-pro`
5. Save credentials for **Google AI Studio / Gemini API**

✅ No other workflow changes are required.

---

## 5️⃣ Customize AI Behavior

You can fine-tune AI responses from the **AI Application Agent configuration**.

### Key Parameters:

| Parameter     | Description                     | Recommended             |
| ------------- | ------------------------------- | ----------------------- |
| `temperature` | Controls creativity vs accuracy | `0.2`                   |
| `modelName`   | AI model used                   | `gpt-4o-mini` or Gemini |
| `maxTokens`   | Output length control           | Default                 |

> Lower temperature ensures **consistent, form-accurate results**, which is critical for government applications.

---

## 6️⃣ Frontend Integration Example

Use the webhook URL in your frontend to send form data.

### Example (JavaScript / React / Next.js)

```js
const response = await fetch(
  'https://apurvadabhade.app.n8n.cloud/webhook/license-agent',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_type: 'FSSAI_REGISTRATION',
      vendor_profile: {
        full_name: 'John Doe',
        mobile: '9876543210',
        email: 'john@example.com'
      },
      business_profile: {
        business_name: 'Doe Food Stall',
        business_type: 'hawker'
      },
      address: {
        address_line: 'MG Road, Pune',
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001'
      },
      documents: {
        aadhaar_card: true,
        pan_card: false,
        passport_photo: true
      }
    })
  }
);

const result = await response.json();
```

---

## 7️⃣ Response Structure (From AI Agent)

The API response may include:

* `status` → READY_TO_PRINT / INCOMPLETE
* `missingFields` → Fields user must answer
* `missingDocuments` → Documents required
* `formData` → Copy-ready form values
* `nextAction` → What the vendor should do next
