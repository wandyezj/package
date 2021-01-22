import { f } from "./external";
test("basic", () => {
    const actual = f();
    const expected = "hello";
    expect(actual).toBe(expected);
});
