import { createPromiseClient } from "@connectrpc/connect";
import { createTransport } from "@connectrpc/connect/protocol-connect";
import {
    AuthService,
    ContestService,
    LeaderboardService,
    MatchService,
    PicksService,
    UsersService
} from "wcwcpp-api";

// Fetch the base URL from the environment or default to localhost:8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Custom request interceptor to append JWT bearer tokens for authentication
const authInterceptor = (next: any) => {
    return async (req: any) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("wcwcpp_token");
            if (token) {
                req.header.set("Authorization", `Bearer ${token}`);
            }
        }
        return await next(req);
    };
};
// Helper to read all chunks from an AsyncIterable into a single Uint8Array
const readAllChunks = async (iterable: AsyncIterable<Uint8Array>): Promise<Uint8Array> => {
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    for await (const chunk of iterable) {
        chunks.push(chunk);
        totalLength += chunk.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
};

// Helper to convert a browser ReadableStream into an AsyncIterable
async function* readableStreamToAsyncIterable(stream: ReadableStream<Uint8Array>): AsyncIterable<Uint8Array> {
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}

// Simple browser-native HTTP client to completely avoid streaming request body duplex issues
const simpleBrowserHttpClient = async (req: any) => {
    let body: Uint8Array | null = null;
    if (req.body !== undefined) {
        body = await readAllChunks(req.body);
    }

    const init: RequestInit = {
        method: req.method,
        headers: req.header,
        signal: req.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && body !== null) {
        init.body = body as any;
    }

    const res = await fetch(req.url, init);

    const responseBody = res.body ? readableStreamToAsyncIterable(res.body) : undefined;

    // Clone response headers and delete content-length.
    // Standard browsers automatically decompress response bodies, meaning the size of the 
    // decompressed stream will exceed the raw/compressed Content-Length header value,
    // which otherwise triggers ConnectRPC length mismatch validation failures.
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-length");

    return {
        status: res.status,
        header: responseHeaders,
        body: responseBody,
        trailer: new Headers(),
    };
};

export const transport = createTransport({
    baseUrl: API_BASE_URL,
    httpClient: simpleBrowserHttpClient,
    interceptors: [authInterceptor],
    useBinaryFormat: false,
    acceptCompression: [],
    sendCompression: null,
    compressMinBytes: Number.MAX_SAFE_INTEGER,
    readMaxBytes: Number.MAX_SAFE_INTEGER,
    writeMaxBytes: Number.MAX_SAFE_INTEGER,
} as any);

export const authClient = createPromiseClient(AuthService, transport);
export const contestsClient = createPromiseClient(ContestService, transport);
export const leaderboardsClient = createPromiseClient(LeaderboardService, transport);
export const matchesClient = createPromiseClient(MatchService, transport);
export const picksClient = createPromiseClient(PicksService, transport);
export const usersClient = createPromiseClient(UsersService, transport);

// Shared error mapper to translate technical network/transport/fetch errors into clean human-friendly statements
export const mapApiError = (err: any): string => {
    const msg = String(err?.message || err || "");
    if (
        msg.includes("Failed to fetch") ||
        msg.includes("fetch") ||
        msg.includes("network") ||
        msg.includes("Connect error") ||
        msg.includes("TypeError") ||
        msg.includes("failed to fetch")
    ) {
        return "Cannot fetch data. Please try again later.";
    }
    return msg || "An unexpected error occurred while communicating with the server.";
};
