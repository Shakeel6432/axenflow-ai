import net from "node:net";
import { randomBytes } from "node:crypto";

export type CatchAllProbeResult = {
  isCatchAll: boolean | null;
  detail: string;
  probed: boolean;
};

/**
 * Phase 1 catch-all check: one RCPT TO against a high-entropy fake local part.
 * Disabled unless EMAIL_FINDER_CATCHALL_PROBE=1 — probing from the app IP is risky.
 * Never sends DATA / never transmits a message.
 */
export function isCatchAllProbeEnabled() {
  const v = process.env.EMAIL_FINDER_CATCHALL_PROBE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function readLine(socket: net.Socket, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = "";
    const onData = (chunk: Buffer) => {
      buf += chunk.toString("utf8");
      if (buf.includes("\n")) {
        cleanup();
        resolve(buf.split("\n")[0].replace(/\r$/, ""));
      }
    };
    const onErr = (err: Error) => {
      cleanup();
      reject(err);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP read timeout"));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onErr);
    };
    socket.on("data", onData);
    socket.on("error", onErr);
  });
}

async function writeLine(socket: net.Socket, line: string) {
  await new Promise<void>((resolve, reject) => {
    socket.write(`${line}\r\n`, (err) => (err ? reject(err) : resolve()));
  });
}

async function expectCode(
  socket: net.Socket,
  timeoutMs: number
): Promise<{ code: number; line: string }> {
  // SMTP can send multi-line; keep reading until a line matches NNN<space>
  const deadline = Date.now() + timeoutMs;
  let last = "";
  while (Date.now() < deadline) {
    const line = await readLine(socket, Math.max(500, deadline - Date.now()));
    last = line;
    const m = line.match(/^(\d{3})([\s-])/);
    if (m && m[2] === " ") {
      return { code: Number(m[1]), line };
    }
  }
  return { code: 0, line: last };
}

/**
 * Probe whether domain's MX accepts an obviously fake mailbox (catch-all).
 */
export async function probeCatchAll(
  domain: string,
  mxHosts: string[],
  opts?: { timeoutMs?: number }
): Promise<CatchAllProbeResult> {
  if (!isCatchAllProbeEnabled()) {
    return {
      isCatchAll: null,
      probed: false,
      detail:
        "Catch-all probe disabled (set EMAIL_FINDER_CATCHALL_PROBE=1 to enable). Phase 1 safe default.",
    };
  }
  if (!mxHosts.length) {
    return { isCatchAll: null, probed: false, detail: "No MX hosts to probe" };
  }

  const timeoutMs = opts?.timeoutMs ?? 8000;
  const fakeLocal = `axenfakenotreal${randomBytes(10).toString("hex")}`;
  const fakeEmail = `${fakeLocal}@${domain}`;
  const host = mxHosts[0];

  return await new Promise((resolve) => {
    const socket = net.createConnection({ host, port: 25 });
    let settled = false;
    const finish = (result: CatchAllProbeResult) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.on("timeout", () =>
      finish({ isCatchAll: null, probed: true, detail: `SMTP timeout on ${host}` })
    );
    socket.on("error", (err) =>
      finish({
        isCatchAll: null,
        probed: true,
        detail: `SMTP error on ${host}: ${err.message}`,
      })
    );

    (async () => {
      try {
        const banner = await expectCode(socket, timeoutMs);
        if (banner.code !== 220) {
          finish({
            isCatchAll: null,
            probed: true,
            detail: `Unexpected banner ${banner.code}`,
          });
          return;
        }
        await writeLine(socket, "EHLO axenflow-finder.local");
        await expectCode(socket, timeoutMs);
        await writeLine(socket, "MAIL FROM:<>");
        const mailFrom = await expectCode(socket, timeoutMs);
        if (mailFrom.code >= 400) {
          // Some servers reject empty MAIL FROM — try a noreply
          await writeLine(socket, "RSET");
          await expectCode(socket, timeoutMs).catch(() => undefined);
          await writeLine(socket, "MAIL FROM:<probe@axenflowai.com>");
          const retry = await expectCode(socket, timeoutMs);
          if (retry.code >= 400) {
            finish({
              isCatchAll: null,
              probed: true,
              detail: `MAIL FROM rejected (${retry.code})`,
            });
            return;
          }
        }
        await writeLine(socket, `RCPT TO:<${fakeEmail}>`);
        const rcpt = await expectCode(socket, timeoutMs);
        await writeLine(socket, "QUIT").catch(() => undefined);

        if (rcpt.code === 250 || rcpt.code === 251) {
          finish({
            isCatchAll: true,
            probed: true,
            detail: `Fake address accepted (${rcpt.code}) — likely catch-all`,
          });
          return;
        }
        if (rcpt.code >= 550 && rcpt.code < 560) {
          finish({
            isCatchAll: false,
            probed: true,
            detail: `Fake address rejected (${rcpt.code}) — not catch-all`,
          });
          return;
        }
        finish({
          isCatchAll: null,
          probed: true,
          detail: `Inconclusive RCPT response ${rcpt.code}: ${rcpt.line}`,
        });
      } catch (err) {
        finish({
          isCatchAll: null,
          probed: true,
          detail: err instanceof Error ? err.message : "Catch-all probe failed",
        });
      }
    })();
  });
}
