export function website(): string {
    return "website";
}

export function clock() {
    setInterval(() => {
        const element = document.getElementById("insert");
        if (element) {
            element.innerText = Date.now().toString();
        }
    }, 1000);
}
