import { website } from "../src/website";
test("basic", () => {
    const actual = website();
    const expected = "website";
    expect(actual).toBe(expected);
});
