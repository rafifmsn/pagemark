# System Architecture & Webhook Security

Pagemark is designed with a strict security boundary to protect user configurations, API endpoints, and authentication tokens (such as Bearer tokens) from site-level cross-site scripting (XSS) vulnerabilities.

## Secure Webhook Architecture

When you dispatch a parsed Markdown page to a custom webhook target, the data flow crosses an isolated boundary to ensure absolute safety:

```mermaid
graph TD
    %% System Architecture Diagram for Custom Webhook Feature
    classDef domainWebpage fill:#fcf8f2,stroke:#d97706,stroke-width:2px,color:#000000;
    classDef domainSandbox fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#000000;
    classDef domainExternal fill:#f0fdfa,stroke:#0d9488,stroke-width:2px,color:#000000;
    classDef vulnerability fill:#fef2f2,stroke:#dc2626,stroke-width:1px,stroke-dasharray: 4 4,color:#dc2626;
    classDef processStep fill:#ffffff,stroke:#4b5563,stroke-width:1px,color:#000000;

    subgraph Webpage [Webpage DOM Context]
        PageContent[Target Webpage Data] --> ContentScript[content.ts: Parser]
        XSS[Potential Site XSS Vector] -.->|Exploits Access| InsecureStorage
        
        subgraph InsecureStorage [Standard Web Storage]
            LocalStorage[localStorage]
            IndexedDB[IndexedDB]
        end
    end
    class Webpage,PageContent,ContentScript,InsecureStorage,LocalStorage,IndexedDB domainWebpage;
    class XSS vulnerability;

    subgraph Sandbox [Isolated Extension Sandbox - Plasmo MV3]
        subgraph SecureStorage [Isolated Storage]
            ChromeStorage[(chrome.storage.local)]
        end

        subgraph BackgroundProcess [Background Worker - background.ts]
            MsgListener[Message Listener]
            UrlValidator{Protocol Validator}
            HttpError[Block Request / Log Error]
            NetworkDispatch[fetch Client]
        end
    end
    class Sandbox,SecureStorage,ChromeStorage,BackgroundProcess,MsgListener,UrlValidator,HttpError,NetworkDispatch domainSandbox;

    subgraph External [External Environment]
        UserEndpoint[User Target API / Webhook Endpoint]
        DevTools[Local Browser DevTools Network Tab]
    end
    class External,UserEndpoint,DevTools domainExternal;
    
    ContentScript -->|1. Post-Parsing IPC Trigger| MsgListener
    XSS -.->|BLOCKED: Cannot cross context| ChromeStorage
    
    MsgListener -->|2. Query Config & Headers| ChromeStorage
    ChromeStorage -->|3. Return Plaintext Headers| MsgListener
    
    MsgListener -->|4. Forward Request Payload| UrlValidator
    
    UrlValidator -->|5a. Input URL is http://| HttpError
    UrlValidator -->|5b. Input URL is https:// or localhost| NetworkDispatch
    
    NetworkDispatch -->|6. Encrypted Network Transport| UserEndpoint
    NetworkDispatch -.->|7. Local Traffic Inspection| DevTools

    class ContentScript,MsgListener,UrlValidator,HttpError,NetworkDispatch processStep;
```

---

## Key Security Blockades

### 1. Isolated Background Dispatch (CSP & CORS Bypass)
- **Problem**: Webpages have strict Content Security Policies (CSP) that restrict where scripts can send data. Content scripts (`content.ts`) running in the webpage DOM cannot send `fetch` requests to third-party endpoints or local servers.
- **Solution**: Pagemark sends an IPC message to the extension's background service worker (`background.ts`). The background worker performs the network request. Because the service worker runs in the extension sandbox, it bypasses the webpage's CSP rules and successfully routes requests to any target domain allowed under Pagemark's `<all_urls>` host permissions.

### 2. XSS Protection (Context Boundary)
- **Problem**: If target webpages suffer from Cross-Site Scripting (XSS) vulnerabilities, malicious scripts can read values stored in standard web storage like `localStorage` or `IndexedDB`.
- **Solution**: Pagemark stores webhook URLs and authorization headers in `chrome.storage.local`. This storage is completely invisible to the webpage context and target DOM. Webpage scripts cannot read or sniff your API keys.

### 3. Enforced HTTPS Transport
- **Problem**: Sending authentication tokens over unencrypted `http://` transport exposes them to Man-in-the-Middle (MitM) packet sniffing.
- **Solution**: The protocol validator enforces secure `https://` transport for all webhook dispatches. Standard `http://` transport is restricted to `localhost` and `127.0.0.1` contexts to assist local testing.
