import useAuthStore from "@/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    if (!isHydrated) return null;

    if (isAuthenticated) {
        return <Redirect href="/home-screen" />;
    }

    return <Redirect href="/(auth)/login-signup" />;
}
