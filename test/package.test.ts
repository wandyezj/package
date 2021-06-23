import { hello } from "../src/index";

test("basic", () => {
    const actual = hello();
    const expected = "hello";
    expect(actual).toBe(expected);
});
