// Creates a Gmail draft with rich HTML and an optional inline image purely from the client.
// Falls back to returning false if Google client isn't configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID).

type LoadScriptOptions = { async?: boolean };

const loadScript = (src: string, opts: LoadScriptOptions = {}): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = opts.async ?? true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

const base64Url = (input: string): string =>
  btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1)
    binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
};

const buildMimeWithInlineImage = (
  to: string,
  subject: string,
  html: string,
  imageBase64?: string,
  imageMime?: string
): string => {
  const boundary = "gc_boundary_" + Math.random().toString(36).slice(2);
  const headers = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/related; boundary="${boundary}"`,
    "",
  ].join("\r\n");

  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
  ].join("\r\n");

  const imagePart = imageBase64
    ? [
        `--${boundary}`,
        `Content-Type: ${imageMime || "image/jpeg"}`,
        "Content-Transfer-Encoding: base64",
        "Content-ID: <inline-image-1>",
        "Content-Disposition: inline",
        "",
        imageBase64,
        "",
      ].join("\r\n")
    : "";

  const closing = `--${boundary}--`;
  const mime = [headers, htmlPart, imagePart, closing]
    .filter(Boolean)
    .join("\r\n");
  return base64Url(mime);
};

const ensureGapi = async (): Promise<boolean> => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return false;
  await Promise.all([
    loadScript("https://accounts.google.com/gsi/client"),
    loadScript("https://apis.google.com/js/api.js"),
  ]);
  // @ts-expect-error gapi provided by loaded script
  if (!window.gapi || !window.google) return false;
  // @ts-expect-error gapi provided by loaded script
  await new Promise<void>((res) => window.gapi.load("client", () => res()));
  // @ts-expect-error gapi provided by loaded script
  await window.gapi.client.init({
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
    ],
  });
  return true;
};

export const createDraftWithInlineImage = async (params: {
  to: string;
  subject: string;
  html: string; // May reference cid:INLINE_IMAGE_1 which will be swapped depending on availability
  imageUrl?: string;
}): Promise<{ ok: boolean; draftId?: string }> => {
  if (typeof window === "undefined") return { ok: false };
  const ok = await ensureGapi();
  if (!ok) return { ok: false };
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  // @ts-expect-error google provided by loaded script
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/gmail.compose",
    callback: () => {},
  });
  const token: string = await new Promise((resolve, reject) => {
    tokenClient.callback = (resp: {
      access_token?: string;
      error?: unknown;
    }) => {
      if (resp && resp.access_token) resolve(resp.access_token);
      else reject(resp?.error || new Error("OAuth failed"));
    };
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
  // @ts-expect-error gapi provided by loaded script
  window.gapi.client.setToken({ access_token: token });

  let imageBase64: string | undefined;
  let imageMime: string | undefined;
  if (params.imageUrl) {
    try {
      const resp = await fetch(params.imageUrl, { mode: "cors" });
      const blob = await resp.blob();
      const buf = await blob.arrayBuffer();
      imageBase64 = arrayBufferToBase64(buf);
      imageMime = blob.type || "image/jpeg";
    } catch {
      // Ignore image embedding errors; proceed without the inline image
    }
  }

  let html = params.html;
  if (imageBase64) {
    html = html.replace("cid:INLINE_IMAGE_1", "cid:inline-image-1");
  } else if (params.imageUrl) {
    html = html.replace("cid:INLINE_IMAGE_1", params.imageUrl);
  }
  const raw = buildMimeWithInlineImage(
    params.to,
    params.subject,
    html,
    imageBase64,
    imageMime
  );

  try {
    // @ts-expect-error gapi provided by loaded script
    const res = await window.gapi.client.gmail.users.drafts.create({
      userId: "me",
      resource: { message: { raw } },
    });
    const draftId = res.result?.id as string | undefined;
    return { ok: true, draftId };
  } catch {
    return { ok: false };
  }
};
