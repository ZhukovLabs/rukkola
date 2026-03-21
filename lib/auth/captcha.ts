const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY;
const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

export async function verifyCaptcha(token: string | undefined): Promise<{ success: boolean; error?: string }> {
    if (!HCAPTCHA_SECRET) {
        console.warn("HCAPTCHA_SECRET_KEY не настроен — CAPTCHA проверка пропущена");
        return { success: true };
    }

    if (!token) {
        return { success: false, error: "CAPTCHA не пройдена" };
    }

    try {
        const response = await fetch(HCAPTCHA_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${encodeURIComponent(HCAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
        });

        const data = await response.json();

        if (!data.success) {
            return { success: false, error: "CAPTCHA не пройдена" };
        }

        return { success: true };
    } catch (error) {
        console.error("Ошибка проверки CAPTCHA:", error);
        return { success: false, error: "Ошибка проверки CAPTCHA" };
    }
}