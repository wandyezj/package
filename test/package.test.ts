import { f } from "../src/index";

test("basic", () => {
    const actual = f();
    const expected = "hello";
    expect(actual).toBe(expected);
});
