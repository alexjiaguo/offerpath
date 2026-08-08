import { describe, it, expect, beforeEach } from "vitest";
import {
 setGuestSession,
 clearGuestSession,
 isGuestMode,
 setMockAuthSession,
 clearMockAuthSession,
} from "@/lib/auth";

function getCookie(name: string): string | null {
 if (typeof document === "undefined") return null;
 const pair = document.cookie
 .split("; ")
 .find((c) => c.startsWith(`${name}=`));
 return pair ? pair.split("=")[1] ?? null : null;
}

describe("auth helpers — guest mode", () => {
 beforeEach(() => {
 document.cookie.split("; ").forEach((c) => {
 const name = c.split("=")[0];
 if (name) document.cookie = `${name}=; path=/; max-age=0`;
 });
 });

 it("setGuestSession sets the guest cookie and isGuestMode returns true", () => {
 expect(isGuestMode()).toBe(false);
 setGuestSession();
 expect(getCookie("offerpath_guest")).toBe("1");
 expect(isGuestMode()).toBe(true);
 });

 it("clearGuestSession removes the guest cookie", () => {
 setGuestSession();
 clearGuestSession();
 expect(getCookie("offerpath_guest")).toBeNull();
 expect(isGuestMode()).toBe(false);
 });

 it("setMockAuthSession clears guest cookie (signed-in user is not a guest)", () => {
 setGuestSession();
 setMockAuthSession("user@example.com");
 expect(getCookie("offerpath_guest")).toBeNull();
 expect(isGuestMode()).toBe(false);
 });

 it("clearMockAuthSession + setGuestSession round-trip", () => {
 setMockAuthSession("user@example.com");
 clearMockAuthSession();
 setGuestSession();
 expect(isGuestMode()).toBe(true);
 });
});
