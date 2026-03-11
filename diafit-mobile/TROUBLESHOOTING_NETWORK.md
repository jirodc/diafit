# Troubleshooting: "Network request failed"

This error usually means the app cannot reach the server (Supabase). Try these steps in order.

---

## 1. Check Supabase project status

- Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
- If the project is **paused** (common on free tier after inactivity), click **Restore project**.
- After it’s running, try the app again.

---

## 2. Confirm device/emulator has internet

- **Physical device:** Open a browser and load any website. If it fails, fix Wi‑Fi or mobile data.
- **Android emulator:** In the emulator, open Chrome and load https://supabase.com. If that fails:
  - Restart the emulator.
  - In AVD Manager, try "Wipe data" or a different device image.
- **iOS Simulator:** Usually has internet if your Mac does. Try Safari inside the simulator.

---

## 3. Use tunnel mode (Expo)

If the device and PC are on different networks (e.g. phone on mobile data), or LAN access is blocked:

```bash
npx expo start --tunnel
```

Then scan the QR code again. Tunnel routes traffic through Expo’s servers and can fix "Network request failed" when the device can’t reach your machine or when LAN is restricted.

---

## 4. Try a physical device

- If you’re on **Android emulator**, run the app on a **real phone** with Expo Go (same Wi‑Fi as your PC, or use `--tunnel`).
- If you’re on **iOS Simulator**, try a **real iPhone** with Expo Go.
- This helps confirm whether the problem is specific to the emulator/simulator.

---

## 5. Check URL and key

- In **app.json** → `expo.extra` you should have:
  - `supabaseUrl`: `https://YOUR_PROJECT_REF.supabase.co` (no trailing slash).
  - `supabaseAnonKey`: your project’s **anon** (public) key from Supabase Dashboard → Settings → API.
- Wrong URL or key can lead to failed requests. Don’t use the service_role key in the app.

---

## 6. Firewall / antivirus (Windows)

- Temporarily allow **Node.js** and **Expo** through Windows Firewall.
- If you use antivirus, temporarily disable it or add an exception for your project folder and Node, then try again.

---

## 7. Quick test in the app

- On the **Welcome** (login) screen, try **Sign in with email**. If that works, Supabase is reachable and the problem may be with a specific call (e.g. auth session refresh or a single screen). If even that fails, the issue is general connectivity to Supabase (steps 1–6).

---

## Summary

| Cause              | What to do                                      |
|--------------------|--------------------------------------------------|
| Project paused     | Restore project in Supabase Dashboard            |
| No internet        | Fix Wi‑Fi/mobile data or emulator network        |
| LAN / different net| Run `npx expo start --tunnel`                    |
| Emulator flaky     | Try physical device or another emulator image    |
| Wrong config       | Check `supabaseUrl` and `supabaseAnonKey`       |
| Firewall/AV        | Allow Node/Expo or temporarily disable          |

If it still fails, check the Supabase status page and your project’s logs in the dashboard for more detail.
