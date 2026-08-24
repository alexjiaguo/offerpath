import { describe, expect, it } from "vitest";
import { extractTextFromHtml } from "@/lib/urlText";

describe("extractTextFromHtml", () => {
  it("strips tags and scripts while keeping readable text", () => {
    const html = `<html><head><style>body{color:red}</style></head>
      <body>
        <script>alert("x")</script>
        <h1>Senior Product Manager</h1>
        <p>We are hiring at <b>Acme</b> &amp; friends.</p>
        <ul><li>5+ years experience</li><li>Remote friendly</li></ul>
      </body></html>`;
    const text = extractTextFromHtml(html);
    expect(text).toContain("Senior Product Manager");
    expect(text).toContain("Acme & friends.");
    expect(text).toContain("5+ years experience");
    expect(text).not.toContain("<");
    expect(text).not.toContain("alert");
    expect(text.toLowerCase()).not.toContain("color:red");
  });

  it("decodes entities and collapses whitespace", () => {
    const text = extractTextFromHtml("<p>Salary&nbsp;range:&lt;TBD&gt;&#65;</p>");
    expect(text).toBe("Salary range:<TBD>A");
  });
});
